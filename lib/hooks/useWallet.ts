import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

// Deklarasi tipe untuk window global
declare global {
  interface Window {
    _forceWalletReconnect?: boolean;
  }
}

export type WalletState = {
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  manuallyDisconnected: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
};

// Tambahkan local storage key untuk menyimpan status disconnect
const DISCONNECTED_KEY = "wallet_manually_disconnected";
// Key untuk menyimpan status autentikasi
const AUTHENTICATED_KEY = "wallet_authenticated";

export function useWallet() {
  // Inisialisasi state dengan memeriksa local storage
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    error: null,
    manuallyDisconnected: localStorage.getItem(DISCONNECTED_KEY) === "true",
    isAuthenticated: localStorage.getItem(AUTHENTICATED_KEY) === "true",
    isAuthenticating: false,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Reset error state setiap kali component re-render
  useEffect(() => {
    if (state.error) {
      // Auto-clear errors after 5 seconds
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        const ethereumProvider = await detectEthereumProvider();

        if (ethereumProvider && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          setProvider(provider);

          // Check if manually disconnected from local storage
          const wasDisconnected =
            localStorage.getItem(DISCONNECTED_KEY) === "true";

          // Only auto-connect if user hasn't manually disconnected
          if (!wasDisconnected) {
            try {
              const accounts = await provider.listAccounts();
              if (accounts.length > 0) {
                const network = await provider.getNetwork();

                // Check if previously authenticated
                const isAuth =
                  localStorage.getItem(AUTHENTICATED_KEY) === "true";

                setState((prev) => ({
                  ...prev,
                  address: accounts[0].address,
                  chainId: network.chainId.toString(),
                  isConnected: true,
                  isAuthenticated: isAuth,
                  error: null, // Reset any previous errors
                }));
              }
            } catch (accountError) {
              console.warn("Failed to auto-connect accounts:", accountError);
              // Silently fail for auto-connect - don't update error state
            }
          } else {
            // If we were manually disconnected, ensure the state reflects this
            // This prevents any automatic connection attempts by MetaMask
            setState((prev) => ({
              ...prev,
              isConnected: false,
              isAuthenticated: false,
              manuallyDisconnected: true,
              address: null,
              chainId: null,
            }));
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length === 0) {
              // User disconnected
              setState((prev) => ({
                ...prev,
                address: null,
                isConnected: false,
                isAuthenticated: false,
                error: null, // Reset any previous errors
              }));
              localStorage.removeItem(AUTHENTICATED_KEY);
            } else {
              // Account changed - only update if not manually disconnected
              const wasDisconnected =
                localStorage.getItem(DISCONNECTED_KEY) === "true";
              if (!wasDisconnected) {
                setState((prev) => ({
                  ...prev,
                  address: accounts[0],
                  isAuthenticated: false, // Require re-authentication on account change
                  error: null, // Reset any previous errors
                }));
                localStorage.removeItem(AUTHENTICATED_KEY);
              }
            }
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", (chainId: string) => {
            setState((prev) => ({
              ...prev,
              chainId,
              isAuthenticated: false, // Require re-authentication on chain change
              error: null, // Reset any previous errors
            }));
            localStorage.removeItem(AUTHENTICATED_KEY);
          });
        } else {
          setState((prev) => ({
            ...prev,
            error: "Please install MetaMask to use this feature",
          }));
        }
      } catch (error) {
        console.error("Error initializing provider:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to initialize wallet connection",
        }));
      }
    };

    initProvider();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []); // Remove dependency on state.manuallyDisconnected, use localStorage instead

  const connect = useCallback(async () => {
    if (!provider || !window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "Wallet provider not initialized",
        isConnecting: false,
      }));
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
        manuallyDisconnected: false,
      }));

      // Remove the disconnected flag from localStorage
      localStorage.removeItem(DISCONNECTED_KEY);

      // Force new connection request if previously disconnected
      const wasDisconnected = window._forceWalletReconnect;
      if (wasDisconnected) {
        // Reset the force reconnect flag
        delete window._forceWalletReconnect;

        // Force clear any existing connections first
        try {
          await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch (e) {
          console.log(
            "wallet_requestPermissions failed, falling back to eth_requestAccounts"
          );
        }
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet");
      }

      const network = await provider.getNetwork();

      setState((prev) => ({
        ...prev,
        address: accounts[0],
        chainId: network.chainId.toString(),
        isConnected: true,
        isConnecting: false,
        isAuthenticated: false, // Always reset authentication state on connect
        error: null,
      }));

      // Remove authenticated status from localstorage
      localStorage.removeItem(AUTHENTICATED_KEY);

      return true;
    } catch (error: any) {
      console.error("Error connecting wallet:", error);

      // Check for user rejected error - common MetaMask error pattern
      const errorMessage = error?.message || String(error);
      const isUserRejected =
        errorMessage.includes("rejected") ||
        errorMessage.includes("denied") ||
        errorMessage.includes("canceled") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("User rejected");

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: isUserRejected
          ? "User rejected wallet connection"
          : "Failed to connect wallet",
      }));

      // Ensure disconnected state in localStorage if connection fails
      localStorage.setItem(DISCONNECTED_KEY, "true");
      return false;
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    // Store the disconnected state in localStorage to persist between sessions
    localStorage.setItem(DISCONNECTED_KEY, "true");
    localStorage.removeItem(AUTHENTICATED_KEY);

    // Force MetaMask to forget the connection by clearing cached accounts
    if (window.ethereum) {
      try {
        // Force disconnect by clearing permission cache (di beberapa wallet bisa berbeda caranya)
        console.log("Forcing wallet disconnect");

        // Cara 1: Coba revoke permissions (tidak didukung semua wallet)
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch (e) {
          console.log(
            "wallet_revokePermissions not supported, trying alternative"
          );
        }

        // Cara 2: Set flag khusus agar next connect memaksa request baru
        window._forceWalletReconnect = true;
      } catch (e) {
        console.error("Error forcing wallet disconnect:", e);
      }
    }

    // Update state
    setState((prev) => ({
      ...prev,
      address: null,
      chainId: null,
      isConnected: false,
      manuallyDisconnected: true,
      isAuthenticated: false,
      error: null, // Reset any errors
    }));
  }, []);

  // Tambahkan fungsi untuk autentikasi signature
  const authenticate = useCallback(async () => {
    if (!provider || !state.address) {
      setState((prev) => ({
        ...prev,
        error: "Cannot authenticate: No wallet connected",
        isAuthenticating: false,
      }));
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      // Get the signer
      const signer = await provider.getSigner();

      // Create a message to sign
      const timestamp = Date.now();
      const message = `Welcome to NFT Pixel Studio!\n\nThis signature proves you own this wallet address.\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address: ${state.address}\nTimestamp: ${timestamp}`;

      // Request signature from user
      const signature = await signer.signMessage(message);

      // Verify the signature (optional but good practice)
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() === state.address.toLowerCase()) {
        // Signature is valid
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isAuthenticating: false,
          error: null,
        }));

        // Store authentication state
        localStorage.setItem(AUTHENTICATED_KEY, "true");
        return true;
      } else {
        throw new Error("Signature verification failed");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Check for user rejected error
      const errorMessage = error?.message || String(error);
      const isUserRejected =
        errorMessage.includes("rejected") ||
        errorMessage.includes("denied") ||
        errorMessage.includes("canceled") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("User rejected");

      setState((prev) => ({
        ...prev,
        isAuthenticating: false,
        isAuthenticated: false, // Ensure the authenticated flag is explicitly false
        error: isUserRejected
          ? "User rejected signature request"
          : "Failed to authenticate wallet",
      }));

      // If the user rejected the signature, set the disconnect flag to prevent auto-reconnect
      if (isUserRejected) {
        localStorage.setItem(DISCONNECTED_KEY, "true");
      }

      return false;
    }
  }, [provider, state.address]);

  return {
    ...state,
    connect,
    disconnect,
    authenticate,
    provider,
  };
}
