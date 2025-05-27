import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    address: string;
  }

  interface Session {
    user: User & {
      id: string;
      address: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    address: string;
  }
}
