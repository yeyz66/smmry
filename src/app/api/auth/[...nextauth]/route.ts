import NextAuth, { NextAuthOptions, AuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// import { PrismaAdapter } from '@next-auth/prisma-adapter'; // Removed unused import
import { prisma } from '@/lib/prisma'; // Assuming prisma client is here

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable');
}

// Define the auth options in a separate constant
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 3000, // 增加超时时间到 3 秒 (3000ms)
      },
    }),
    // Add other providers here if needed
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: '/auth', // Custom sign-in page
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user ID from the provider into the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like the user ID.
      // Ensure session.user is defined before assigning properties
      if (session.user && token.id) {
        // The Session interface is augmented in src/types/next-auth.d.ts
        session.user.id = token.id as string;
      }
      return session;
    },
  }
};

// Pass the options object to NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 