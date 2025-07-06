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
export async function signInWithEthereum(message: string, signature: string) {
  try {
    const response = await signIn('credentials', {
      message,
      signature,
      redirect: false,
      callbackUrl: '/my',
    });

    if (response?.error) {
      throw new Error(response.error);
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authenticate',
    };
  }
}
