// NextAuth.js configuration for ASATRA
// Edge-compatible auth config (for middleware)

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnHost = nextUrl.pathname.startsWith('/host');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

      // Redirect logged-in users away from auth pages
      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Protect dashboard routes
      if (isOnDashboard || isOnHost || isOnAdmin) {
        if (!isLoggedIn) return false; // Redirect to login
        
        // Role-based access
        const userRole = auth?.user?.role;
        
        if (isOnAdmin && userRole !== 'ADMIN') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        
        if (isOnHost && userRole === 'GUEST') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [], // Providers added in auth.ts
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
