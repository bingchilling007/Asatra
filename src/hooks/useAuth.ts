// Custom auth hook for client-side auth state

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid credentials');
      }

      router.push('/dashboard');
      router.refresh();
    },
    [router]
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  }, [router]);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      confirmPassword: string;
    }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Auto-login after registration
      await login(data.email, data.password);
    },
    [login]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  };
}
