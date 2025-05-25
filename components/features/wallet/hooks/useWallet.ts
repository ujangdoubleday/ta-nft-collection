import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

// Deklarasi tipe untuk window global
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (
        eventName: string,
        handler: (...args: any[]) => void
      ) => void;
      removeAllListeners: (eventName: string) => void;
      isMetaMask?: boolean;
    };
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

/**
 * Hook untuk mengelola koneksi wallet dan autentikasi
 */
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

  /**
   * Connect to the wallet
   */
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
        } catch (_e) {
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
          ? "Connection was rejected by user"
          : `Error connecting: ${errorMessage}`,
      }));

      return false;
    }
  }, [provider]);

  /**
   * Disconnect from the wallet
   */
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      address: null,
      chainId: null,
      isConnected: false,
      isAuthenticated: false,
      manuallyDisconnected: true,
      error: null,
    }));

    // Set flag to force reconnect on next attempt
    window._forceWalletReconnect = true;

    // Store disconnected state to prevent auto-reconnect
    localStorage.setItem(DISCONNECTED_KEY, "true");
    // Remove authenticated status
    localStorage.removeItem(AUTHENTICATED_KEY);
  }, []);

  /**
   * Authenticate the connected wallet
   */
  const authenticate = useCallback(async () => {
    // Check if window is defined (for SSR)
    if (typeof window === "undefined") {
      console.error("Window is not defined, cannot authenticate");
      return false;
    }

    // Check if provider and ethereum are available
    if (!window.ethereum) {
      console.error("MetaMask is not installed");
      setState((prev) => ({
        ...prev,
        error:
          "MetaMask tidak terinstall. Harap install MetaMask dan refresh halaman.",
        isAuthenticating: false,
      }));
      return false;
    }

    if (!provider || !state.address) {
      setState((prev) => ({
        ...prev,
        error: "Connect wallet before authenticating",
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

      console.log("Starting authentication process");

      // Ensure accounts are accessible - this often wakes up MetaMask
      try {
        console.log("Requesting accounts to ensure MetaMask is awake");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Active account:", accounts[0]);

        // Small delay to ensure MetaMask UI is ready
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error("Error requesting accounts:", err);
        throw new Error(
          "Failed to connect to MetaMask. Please check if MetaMask is unlocked."
        );
      }

      // Create signature message
      const message = `Welcome to MyNFTs.exe!\n\nThis signature verifies your wallet ownership.\nIt does not cost any gas or initiate a transaction.\n\nWallet: ${
        state.address
      }\nDate: ${new Date().toISOString()}`;

      console.log("Requesting signature using personal_sign");

      // Convert message to hex
      const hexMessage = ethers.hexlify(ethers.toUtf8Bytes(message));
      console.log("Requesting signature for address:", state.address);

      try {
        // Metode 1: Mencoba langsung dengan window.ethereum
        console.log("Method 1: Using window.ethereum.request directly");
        let signature;

        try {
          signature = await window.ethereum.request({
            method: "personal_sign",
            params: [hexMessage, state.address],
          });
        } catch (directError) {
          console.warn(
            "Direct method failed, trying fallback method",
            directError
          );

          // Metode 2: Mencoba dengan ethers.js BrowserProvider
          console.log("Method 2: Using ethers.js BrowserProvider");
          const signer = await provider.getSigner();
          signature = await signer.signMessage(message);
        }

        console.log("Signature received:", !!signature);

        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        console.log("Verification:", {
          original: state.address.toLowerCase(),
          recovered: recoveredAddress.toLowerCase(),
        });

        // Check if the recovered address matches the connected address
        if (recoveredAddress.toLowerCase() === state.address.toLowerCase()) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isAuthenticating: false,
            error: null,
          }));

          // Store authentication state in localStorage
          localStorage.setItem(AUTHENTICATED_KEY, "true");
          return true;
        } else {
          throw new Error("Signature verification failed");
        }
      } catch (innerError) {
        console.error("Error in signature process:", innerError);
        throw innerError; // Re-throw untuk ditangkap oleh catch di luar
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Check for user rejected signatures
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
        error: isUserRejected
          ? "Signature was rejected by user"
          : `Error signing: ${errorMessage}`,
      }));
      return false;
    }
  }, [provider, state.address]);

  return {
    address: state.address,
    chainId: state.chainId,
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    isAuthenticated: state.isAuthenticated,
    isAuthenticating: state.isAuthenticating,
    error: state.error,
    connect,
    disconnect,
    authenticate,
  };
}
