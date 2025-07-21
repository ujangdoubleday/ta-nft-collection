import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const getProductionDomain = () => {
  if (process.env.VERCEL_ENV === 'production') {
    if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== '') {
      try {
        const url = new URL(process.env.NEXTAUTH_URL);
        if (!url.hostname.includes('localhost')) {
          return url.hostname;
        }
      } catch (error) {
        console.error('Invalid NEXTAUTH_URL:', error);
      }
    }
  }
  return undefined;
};

const cookieDomain = getProductionDomain();
const isProduction = process.env.VERCEL_ENV === 'production';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error('Missing message or signature');
            return null;
          }

          const message = credentials.message;
          const signature = credentials.signature;

          const addressMatch = message.match(/([0][xX][0-9a-fA-F]{40})/);
          if (!addressMatch) {
            console.error('No valid address found in message');
            return null;
          }

          const address = addressMatch[1];

          const user = {
            id: address,
            address,
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          };

          // console.log('User authorized successfully:', { id: user.id, address: user.address });
          return user;
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours
    updateAge: 0,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
        // Only set domain if we have a valid production domain
        ...(cookieDomain && { domain: cookieDomain }),
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
        ...(cookieDomain && { domain: cookieDomain }),
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
        ...(cookieDomain && { domain: cookieDomain }),
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      // console.log('Session callback:', {
      //   tokenSub: token.sub,
      //   tokenAddress: (token as any).address,
      //   sessionUserId: session.user?.id
      // });

      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.address = (token as any).address as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // console.log('JWT callback:', {
      //   hasUser: !!user,
      //   userAddress: user?.address,
      //   tokenSub: token.sub
      // });

      if (user) {
        token.address = user.address;
        // Ensure token.sub is set
        if (!token.sub) {
          token.sub = user.id;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.VERCEL_ENV === 'development',
};
