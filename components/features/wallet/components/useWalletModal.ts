import { useWallet } from '@/lib/hooks/wallet';
import { formatAddress } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export type WalletModalStep = 'connect' | 'sign' | 'checking' | 'details';
export type LogMessage = {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
};

export const useWalletModal = () => {
  // Initialize all state variables
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletModalStep, setWalletModalStep] = useState<WalletModalStep>('connect');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    'Your wallet has been connected and authenticated successfully!',
  );
  const [previousAuthState, setPreviousAuthState] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
  const [_logCounter, setLogCounter] = useState(1);

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

  const addLogMessage = (
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
  ) => {
    const newId = Date.now() + Math.random();
    setLogMessages((prev) => [
      ...prev,
      {
        id: newId,
        message,
        type,
        timestamp: new Date(),
      },
    ]);
    setLogCounter((prev) => prev + 1);
  };

  const clearLogMessages = () => {
    setLogMessages([]);
  };

  // Kembali menggunakan useEffect untuk pemantauan status autentikasi
  useEffect(() => {
    if (isAuthenticated && !previousAuthState && !isDisconnecting) {
      setIsCreatingAccount(false);
      setWalletModalStep('details');

      setSuccessMessage('Your wallet has been connected and authenticated successfully!');
      setShowSuccessNotification(true);

      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    setPreviousAuthState(isAuthenticated);
  }, [isAuthenticated, previousAuthState, isDisconnecting]);

  // Kembali menggunakan useEffect untuk pemantauan status koneksi
  useEffect(() => {
    if (isConnected) {
      if (isAuthenticated) {
        setWalletModalStep('details');
      } else if (isCreatingAccount) {
        setWalletModalStep('checking');
      } else {
        setWalletModalStep('sign');
      }
    } else {
      setWalletModalStep('connect');
    }
  }, [isConnected, isAuthenticated, isCreatingAccount]);

  // Kembali menggunakan useEffect untuk pemantauan error
  useEffect(() => {
    if (error) {
      setIsCreatingAccount(false);
      addLogMessage(`Error: ${error}`, 'error');

      setErrorMessage(
        error.includes('rejected') ||
          error.includes('denied') ||
          error.includes('canceled') ||
          error.includes('cancelled')
          ? 'Connection Cancelled'
          : error,
      );
      setShowErrorNotification(true);
      setIsWalletModalOpen(false);

      const timer = setTimeout(() => {
        setShowErrorNotification(false);
        setErrorMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const getNetworkName = (chainId: string | null) => {
    switch (chainId) {
      case '11155111':
        return 'Sepolia Testnet';
      case '1':
        return 'Ethereum Mainnet';
      case '5':
        return 'Goerli Testnet';
      default:
        return 'Unknown Network';
    }
  };

  // Menggunakan useMutation untuk menyalin alamat wallet
  const copyAddressMutation = useMutation({
    mutationFn: async () => {
      if (address) {
        return navigator.clipboard.writeText(address);
      }
    },
    onSuccess: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
  });

  const copyAddress = (): Promise<void> => {
    try {
      return copyAddressMutation.mutateAsync() as Promise<void>;
    } catch (error) {
      return Promise.resolve();
    }
  };

  const resetWalletStates = () => {
    setIsWalletModalOpen(false);
    setWalletModalStep('connect');
    setShowSuccessNotification(false);
    setShowErrorNotification(false);
    setErrorMessage('');
    setIsCreatingAccount(false);
    clearLogMessages();

    // Clear any pending notification timeouts
    const maxTimeoutId = Number(setTimeout(() => {}, 0));
    for (let i = 1; i < maxTimeoutId; i++) {
      clearTimeout(i);
    }
  };

  // Menggunakan useMutation untuk koneksi wallet
  const connectMutation = useMutation({
    mutationFn: async () => {
      return connect();
    },
    onError: () => {
      resetWalletStates();
    },
    onSuccess: (success) => {
      if (!success) {
        resetWalletStates();
      }
    },
  });

  const handleConnect = (): Promise<void> => {
    try {
      return connectMutation.mutateAsync().then(() => {});
    } catch (error) {
      resetWalletStates();
      return Promise.resolve();
    }
  };

  // Menggunakan useMutation untuk autentikasi wallet
  const authenticateMutation = useMutation({
    mutationFn: async () => {
      return authenticate(() => {
        setIsCreatingAccount(true);
        setWalletModalStep('checking');
        // No log messages or timeouts needed anymore
      });
    },
    onSuccess: (success) => {
      if (!success) {
        disconnect();
        resetWalletStates();
      } else {
        setIsWalletModalOpen(false);
      }
    },
    onError: () => {
      disconnect();
      resetWalletStates();
    },
  });

  const handleAuthenticate = (): Promise<void> => {
    try {
      return authenticateMutation.mutateAsync().then(() => {});
    } catch (error) {
      disconnect();
      resetWalletStates();
      return Promise.resolve();
    }
  };

  const handleCancelSign = (): Promise<void> => {
    disconnect();
    setErrorMessage('Authentication Cancelled by User');
    setShowErrorNotification(true);
    resetWalletStates();

    setTimeout(() => {
      setShowErrorNotification(false);
      setErrorMessage('');
    }, 5000);

    return Promise.resolve();
  };

  // Menggunakan useMutation untuk memutuskan koneksi wallet
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      // Set disconnecting flag to prevent authentication notification
      setIsDisconnecting(true);

      // Cancel all timeouts
      const maxTimeoutId = Number(setTimeout(() => {}, 0));
      for (let i = 1; i < maxTimeoutId; i++) {
        clearTimeout(i);
      }

      // Immediately hide all notifications
      setShowSuccessNotification(false);
      setShowErrorNotification(false);

      // Disconnect wallet and close modal
      disconnect();
      setIsWalletModalOpen(false);

      // Reset disconnecting flag after a short delay
      setTimeout(() => {
        setIsDisconnecting(false);
      }, 1000);
    },
  });

  const handleDisconnect = (): Promise<void> => {
    try {
      return disconnectMutation.mutateAsync().then(() => {});
    } catch (error) {
      return Promise.resolve();
    }
  };

  const handleWalletButtonClick = () => {
    if (isAuthenticated) {
      setWalletModalStep('details');
      setIsWalletModalOpen(true);
    } else if (isCreatingAccount) {
      setWalletModalStep('checking');
      setIsWalletModalOpen(true);
    } else if (isConnected) {
      setWalletModalStep('sign');
      setIsWalletModalOpen(true);
    } else {
      setWalletModalStep('connect');
      setIsWalletModalOpen(true);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      if (isConnected && !isAuthenticated && !isCreatingAccount) {
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
    setErrorMessage('');
  };

  return {
    // State
    isWalletModalOpen,
    copied,
    walletModalStep,
    showSuccessNotification,
    showErrorNotification,
    errorMessage,
    successMessage,
    isCreatingAccount,
    isDisconnecting,
    logMessages,

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
    addLogMessage,
  };
};
