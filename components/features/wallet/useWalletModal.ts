import { useState, useEffect } from "react";
import { useWallet } from "@/lib/hooks/wallet";

export type WalletModalStep = "connect" | "sign" | "details";

export const useWalletModal = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletModalStep, setWalletModalStep] =
    useState<WalletModalStep>("connect");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    address,
    isConnected,
    isConnecting,
    isAuthenticated,
    isAuthenticating,
    error,
    connect,
    disconnect,
    authenticate,
    chainId,
  } = useWallet();

  useEffect(() => {
    if (isConnected) {
      if (isAuthenticated) {
        setWalletModalStep("details");
        if (isWalletModalOpen && walletModalStep === "sign") {
          setIsWalletModalOpen(false);
          setShowSuccessNotification(true);

          const timer = setTimeout(() => {
            setShowSuccessNotification(false);
          }, 5000);

          return () => clearTimeout(timer);
        }
      } else {
        setWalletModalStep("sign");
      }
    } else {
      setWalletModalStep("connect");
    }
  }, [isConnected, isAuthenticated, isWalletModalOpen, walletModalStep]);

  useEffect(() => {
    if (error) {
      setErrorMessage(
        error.includes("rejected") ||
          error.includes("denied") ||
          error.includes("canceled") ||
          error.includes("cancelled")
          ? "Connection Cancelled"
          : error
      );
      setShowErrorNotification(true);
      setIsWalletModalOpen(false);

      const timer = setTimeout(() => {
        setShowErrorNotification(false);
        setErrorMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const getNetworkName = (chainId: string | null) => {
    switch (chainId) {
      case "11155111":
        return "Sepolia Testnet";
      case "1":
        return "Ethereum Mainnet";
      case "5":
        return "Goerli Testnet";
      default:
        return "Unknown Network";
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetWalletStates = () => {
    setIsWalletModalOpen(false);
    setWalletModalStep("connect");
    setShowSuccessNotification(false);
    setShowErrorNotification(false);
    setErrorMessage("");
  };

  const handleConnect = async () => {
    try {
      const success = await connect();
      if (!success) {
        resetWalletStates();
      }
    } catch (err) {
      console.error("Unhandled error in connect:", err);
      resetWalletStates();
    }
  };

  const handleAuthenticate = async () => {
    try {
      const success = await authenticate();
      if (!success) {
        disconnect();
        resetWalletStates();
      }
    } catch (err) {
      console.error("Unhandled error in authenticate:", err);
      disconnect();
      resetWalletStates();
    }
  };

  const handleCancelSign = () => {
    disconnect();
    setErrorMessage("Authentication Cancelled by User");
    setShowErrorNotification(true);
    resetWalletStates();

    setTimeout(() => {
      setShowErrorNotification(false);
      setErrorMessage("");
    }, 5000);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsWalletModalOpen(false);
  };

  const handleWalletButtonClick = () => {
    if (isAuthenticated) {
      setWalletModalStep("details");
      setIsWalletModalOpen(true);
    } else if (isConnected) {
      setWalletModalStep("sign");
      setIsWalletModalOpen(true);
    } else {
      setWalletModalStep("connect");
      setIsWalletModalOpen(true);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      if (isConnected && !isAuthenticated) {
        disconnect();
      }
      setIsWalletModalOpen(false);
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const handleCloseSuccessNotification = () => {
    setShowSuccessNotification(false);
  };

  const handleCloseErrorNotification = () => {
    setShowErrorNotification(false);
    setErrorMessage("");
  };

  return {
    // State
    isWalletModalOpen,
    copied,
    walletModalStep,
    showSuccessNotification,
    showErrorNotification,
    errorMessage,

    // Wallet data
    address,
    isConnected,
    isConnecting,
    isAuthenticated,
    isAuthenticating,
    chainId,

    // Methods
    getNetworkName,
    copyAddress,
    handleConnect,
    handleAuthenticate,
    handleCancelSign,
    handleDisconnect,
    handleWalletButtonClick,
    handleDialogOpenChange,
    handleCloseSuccessNotification,
    handleCloseErrorNotification,
  };
};
