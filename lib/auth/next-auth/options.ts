import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Get the domain for cookies - fix for production
const getProductionDomain = () => {
  if (process.env.NODE_ENV === 'production') {
    // First check if NEXTAUTH_URL exists and is not empty
    if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== '') {
      try {
        const url = new URL(process.env.NEXTAUTH_URL);
        // Only return domain if not localhost
        if (!url.hostname.includes('localhost')) {
          return url.hostname;
        }
      } catch (error) {
        console.error('Invalid NEXTAUTH_URL:', error);
        // Return undefined to use default domain behavior
        return undefined;
      }
    } else {
      console.warn('NEXTAUTH_URL is not set or is empty, using default domain behavior');
    }
    // If no valid NEXTAUTH_URL set, don't set domain (will use current domain)
    return undefined;
  }
  return undefined;
};

const cookieDomain = getProductionDomain();
const isProduction = process.env.NODE_ENV === 'production';

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

          try {
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

            // console.log('User authorized:', user);
            return user;
          } catch (error) {
            console.error('Error in signature verification:', error);
            return null;
          }
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
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
        domain: cookieDomain,
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      // console.log('Session callback - token:', token);
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.address = token.address as string;
      }
      // console.log('Session callback - session:', session);
      return session;
    },
    async jwt({ token, user }) {
      // console.log('JWT callback - user:', user);
      if (user) {
        token.address = user.address;
      }
      // console.log('JWT callback - token:', token);
      return token;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign in
    error: '/', // Redirect to home page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
