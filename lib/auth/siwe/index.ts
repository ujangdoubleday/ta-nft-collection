'use client';

import { getCsrfToken, signIn } from 'next-auth/react';
import { SiweMessage } from 'siwe';

/**
 * Creates a SIWE message for authentication
 */
export async function createSiweMessage(address: string, statement: string) {
  try {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) throw new Error('CSRF token not found');

    // Get the domain and origin
    const domain = window.location.host;
    const origin = window.location.origin;

    // Create a properly formatted EIP-4361 message string
    const messageToSign = `${statement}

URI: ${origin}
Version: 1
Chain ID: 1
Nonce: ${csrfToken}
Issued At: ${new Date().toISOString()}`;

    return messageToSign;
  } catch (error) {
    throw error;
  }
}

/**
 * Signs in with Ethereum using the provided message and signature
 */
export async function signInWithEthereum(message: string, signature: string) {
  try {
    const res = await signIn('credentials', {
      message,
      signature,
      redirect: false,
      callbackUrl: window.location.href,
    });

    return { success: res?.ok ?? false, error: res?.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
