'use client';

import { getCsrfToken, signIn } from 'next-auth/react';

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
  callbackUrl: string = '/my',
) {
  try {
    // console.log('Signing in with Ethereum...', { message, signature, callbackUrl });

    const response = await signIn('credentials', {
      message,
      signature,
      redirect: false,
    });

    // console.log('Sign in response:', response);

    if (response?.error) {
      throw new Error(response.error);
    }

    if (response?.ok) {
      // Force a longer delay in production to ensure session is set properly
      const delayTime = process.env.NODE_ENV === 'production' ? 1000 : 100;
      await new Promise((resolve) => setTimeout(resolve, delayTime));

      // In production, force a page reload to ensure session is properly loaded
      if (process.env.NODE_ENV === 'production') {
        window.location.href = callbackUrl;
      }
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
