import { useState, useCallback } from 'react';
import axios from 'axios';

// Etherscan API key - in production, this should be loaded from environment variables
const ETHERSCAN_API_KEY =
  process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'DWCZCQIAE1CKSAFII8D1M16JW4HR2BJTSY';

export interface VerifyContractParams {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string; // e.g., "v0.8.20+commit.a1b79de6"
  optimizationUsed: boolean;
  runs?: number; // optimization runs, default 200
  constructorArguments: string; // ABI-encoded constructor arguments
}

export function useVerifyContract() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);

  const verifyContract = useCallback(async (params: VerifyContractParams) => {
    try {
      setIsVerifying(true);
      setError(null);

      console.log(
        'VERIFY CONTRACT: Using API key (truncated):',
        ETHERSCAN_API_KEY ? `${ETHERSCAN_API_KEY.substring(0, 6)}...` : 'NOT SET',
      );

      if (!ETHERSCAN_API_KEY) {
        throw new Error('Etherscan API key is not configured');
      }

      // Untuk sepolia network
      const etherscanApiUrl = 'https://api-sepolia.etherscan.io/api';

      // Log verification parameters for debugging
      console.log('Verifying contract with params:', {
        contractAddress: params.contractAddress,
        contractName: params.contractName,
        compilerVersion: params.compilerVersion,
        constructorArgsLength: params.constructorArguments.length,
        optimizationUsed: params.optimizationUsed,
        runs: params.runs || 200,
      });

      // Siapkan data untuk API call sebagai parameter objek
      const apiParams = {
        apikey: ETHERSCAN_API_KEY,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: params.contractAddress,
        sourceCode: params.sourceCode,
        contractname: params.contractName,
        compilerversion: params.compilerVersion,
        optimizationUsed: params.optimizationUsed ? '1' : '0',
        runs: (params.runs || 200).toString(),
        constructorArguments: params.constructorArguments,
        licenseType: '3', // MIT License
        evmversion: '', // Default EVM version
      };

      console.log('Submitting contract verification request to Etherscan...');
      console.log('Etherscan API URL:', etherscanApiUrl);

      // Use axios with the suggested format
      try {
        console.log('Trying verification with axios...');
        const axiosResponse = await axios.post(etherscanApiUrl, null, { params: apiParams });

        console.log('Verification API response (axios):', axiosResponse.data);

        if (axiosResponse.data.status === '1') {
          console.log('Verification submission successful. GUID:', axiosResponse.data.result);
          const verificationResult = await checkVerificationStatus(
            axiosResponse.data.result,
            etherscanApiUrl,
          );
          setResult(verificationResult);
          return verificationResult;
        } else {
          throw new Error(`Verification submission failed: ${axiosResponse.data.result}`);
        }
      } catch (axiosError) {
        console.warn('Axios attempt failed:', axiosError);
        console.log('Falling back to URLSearchParams + fetch...');

        // Convert params to URLSearchParams for fetch API
        const urlParams = new URLSearchParams();
        Object.entries(apiParams).forEach(([key, value]) => {
          urlParams.append(key, value as string);
        });

        const response = await fetch(etherscanApiUrl, {
          method: 'POST',
          body: urlParams,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Verification API response (fetch):', data);

        if (data.status === '1') {
          console.log('Verification submission successful. GUID:', data.result);
          const verificationResult = await checkVerificationStatus(data.result, etherscanApiUrl);
          setResult(verificationResult);
          return verificationResult;
        } else {
          throw new Error(`Verification submission failed: ${data.result}`);
        }
      }
    } catch (err) {
      console.error('Error verifying contract:', err);
      const error = err instanceof Error ? err : new Error('Unknown error verifying contract');
      setError(error);
      return { status: 'error', message: error.message };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Helper function untuk cek status verifikasi
  const checkVerificationStatus = async (
    guid: string,
    apiUrl: string,
    retryCount = 0,
  ): Promise<{ status: string; message: string }> => {
    try {
      console.log(`Checking verification status (attempt ${retryCount + 1})...`);

      // Tunggu sebentar untuk memberi waktu verifikasi
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const params = {
        apikey: ETHERSCAN_API_KEY,
        module: 'contract',
        action: 'checkverifystatus',
        guid,
      };

      console.log(
        `Verification status check URL: ${apiUrl}?module=contract&action=checkverifystatus&guid=${guid.substring(0, 8)}...`,
      );

      // Use axios with the suggested format
      const response = await axios.get(apiUrl, { params });
      const data = response.data;

      console.log('Verification status check response:', data);

      if (data.status === '1') {
        return { status: 'success', message: 'Contract successfully verified' };
      } else if (data.result === 'Pending in queue') {
        // Masih dalam antrian, coba cek lagi
        console.log('Verification still pending, checking again...');

        // Limit retries to prevent infinite recursion
        if (retryCount >= 5) {
          return {
            status: 'pending',
            message:
              'Verification is still pending after multiple checks. You can check Etherscan manually later.',
          };
        }

        return await checkVerificationStatus(guid, apiUrl, retryCount + 1);
      } else {
        return { status: 'error', message: data.result };
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
      return { status: 'error', message: 'Failed to check verification status' };
    }
  };

  return {
    verifyContract,
    isVerifying,
    error,
    result,
  };
}
