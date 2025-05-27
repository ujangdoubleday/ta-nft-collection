import { useWallet } from '@/lib/hooks/wallet';
import { formatAddress } from '@/lib/utils';
import { useEffect, useState } from 'react';

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
  const [previousAuthState, setPreviousAuthState] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
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

  useEffect(() => {
    if (isAuthenticated && !previousAuthState) {
      setIsCreatingAccount(false);
      setWalletModalStep('details');
      addLogMessage('Authentication completed successfully!', 'success');
      clearLogMessages();

      setShowSuccessNotification(true);

      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    setPreviousAuthState(isAuthenticated);
  }, [isAuthenticated, previousAuthState]);

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

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
  };

  const handleConnect = async () => {
    try {
      const success = await connect();
      if (!success) {
        resetWalletStates();
      }
    } catch (err) {
      resetWalletStates();
    }
  };

  const handleAuthenticate = async () => {
    try {
      const success = await authenticate(() => {
        setIsCreatingAccount(true);
        setWalletModalStep('checking');

        clearLogMessages();
        addLogMessage('Starting wallet verification protocol...', 'info');
        addLogMessage('Checking signature...', 'info');

        setTimeout(() => {
          addLogMessage('Signature verified successfully.', 'success');
          addLogMessage('Scanning blockchain for wallet address...', 'info');
        }, 800);

        setTimeout(() => {
          const addressDisplay = address ? formatAddress(address) : '0x...';
          addLogMessage(`Address found: ${addressDisplay}`, 'success');
          addLogMessage('Checking user database...', 'info');
        }, 1600);

        setTimeout(() => {
          if (Math.random() > 0.5) {
            addLogMessage('WARNING: User record not found!', 'warning');
            addLogMessage('Creating new user profile...', 'info');

            setTimeout(() => {
              addLogMessage('Allocating database storage...', 'info');
            }, 600);

            setTimeout(() => {
              addLogMessage('User profile created successfully!', 'success');
              addLogMessage('Generating authentication token...', 'info');
            }, 1200);
          } else {
            addLogMessage('User record found in database.', 'success');
            addLogMessage('Validating wallet credentials...', 'info');

            setTimeout(() => {
              addLogMessage('Credentials validated.', 'success');
              addLogMessage('Generating authentication token...', 'info');
            }, 800);
          }
        }, 2400);

        setTimeout(() => {
          addLogMessage('Establishing secure session...', 'info');
        }, 3200);

        setTimeout(() => {
          addLogMessage('Session established successfully.', 'success');
          addLogMessage('Finalizing authentication...', 'info');
        }, 3800);
      });

      if (!success) {
        disconnect();
        resetWalletStates();
      } else {
        setIsWalletModalOpen(false);
      }
    } catch (err) {
      disconnect();
      resetWalletStates();
    }
  };

  const handleCancelSign = () => {
    disconnect();
    setErrorMessage('Authentication Cancelled by User');
    setShowErrorNotification(true);
    resetWalletStates();

    setTimeout(() => {
      setShowErrorNotification(false);
      setErrorMessage('');
    }, 5000);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsWalletModalOpen(false);
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
    isCreatingAccount,
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
