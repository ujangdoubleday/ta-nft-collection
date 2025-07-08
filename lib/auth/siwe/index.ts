'use client';

import { getCsrfToken, signIn, getSession } from 'next-auth/react';

/**
 * Creates a SIWE message for authentication
 */
export async function createSiweMessage(address: string, statement: string) {
  const csrfToken = await getCsrfToken();
  if (!csrfToken) throw new Error('Failed to get CSRF token');

  const message = `${statement}

Wallet address: ${address}
Nonce: ${csrfToken}
Issued At: ${new Date().toISOString()}`;

  return message;
}

/**
 * Signs in with Ethereum using the provided message and signature
 */
export async function signInWithEthereum(
  message: string,
  signature: string,
  callbackUrl: string = '/api/auth/login',
) {
  try {
    const response = await signIn('credentials', {
      message,
      signature,
      redirect: false,
    });

    if (response?.error) {
      throw new Error(response.error);
    }

    if (response?.ok) {
      // In production, try to ensure session is fully established
      if (process.env.NODE_ENV === 'production') {
        // Force a longer delay in production to ensure session is set properly
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Verify session was properly set
        const session = await getSession();

        if (session?.user) {
          // Add session token to localStorage as backup
          try {
            localStorage.setItem('lastAuthAddress', session.user.address as string);
            localStorage.setItem('lastAuthTime', new Date().toISOString());
          } catch (e) {
            // Silently handle localStorage errors
          }
        }

        // Force a page reload to ensure session is properly loaded
        window.location.href = callbackUrl;
        return { success: true, error: null, response };
      }

      //dev
      window.location.href = callbackUrl;
      // For development, use a shorter delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return { success: true, error: null, response };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authenticate',
      response: null,
    };
  }
}

/**
 * Helper function to check if user is authenticated
 */
export function isUserAuthenticated(session: any, address: string): boolean {
  return !!(
    session &&
    session.user &&
    session.user.address &&
    session.user.address.toLowerCase() === address.toLowerCase()
  );
}
