import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';

// Get the domain for cookies
const cookieDomain =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).hostname
      : undefined
    : undefined;

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
            return null;
          }

          try {
            const message = credentials.message;
            const signature = credentials.signature;

            const addressMatch = message.match(/([0][xX][0-9a-fA-F]{40})/);
            if (!addressMatch) {
              return null;
            }

            const address = addressMatch[1];

            let user = await prisma.user.findUnique({
              where: {
                address: address.toLowerCase(),
              },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  address: address.toLowerCase(),
                  name: `User ${address.slice(0, 6)}`,
                },
              });
            }

            return {
              id: user.id,
              address,
              name: user.name,
            };
          } catch (error) {
            return null;
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60,
    updateAge: 0,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain,
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.address = token.address as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.address = user.address;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
