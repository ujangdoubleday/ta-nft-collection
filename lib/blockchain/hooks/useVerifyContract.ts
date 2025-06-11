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

      // Etherscan API URL for Sepolia network
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

      // Prepare request data according to Etherscan API specification
      const formData = new FormData();
      formData.append('apikey', ETHERSCAN_API_KEY);
      formData.append('module', 'contract');
      formData.append('action', 'verifysourcecode');
      formData.append('contractaddress', params.contractAddress);
      formData.append('sourceCode', params.sourceCode);
      formData.append('codeformat', 'solidity-single-file');
      formData.append('contractname', params.contractName);
      formData.append('compilerversion', params.compilerVersion);
      formData.append('optimizationUsed', params.optimizationUsed ? '1' : '0');
      formData.append('runs', (params.runs || 200).toString());
      formData.append('constructorArguements', params.constructorArguments); // Note: Etherscan uses this spelling
      formData.append('licenseType', '3'); // MIT License

      console.log('Submitting contract verification request to Etherscan...');
      console.log('Etherscan API URL:', etherscanApiUrl);

      try {
        console.log('Sending verification request...');
        const response = await axios.post(etherscanApiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Verification API response:', response.data);

        if (response.data.status === '1') {
          console.log('Verification submission successful. GUID:', response.data.result);
          const verificationResult = await checkVerificationStatus(
            response.data.result,
            etherscanApiUrl,
          );
          setResult(verificationResult);
          return verificationResult;
        } else {
          throw new Error(`Verification submission failed: ${response.data.result}`);
        }
      } catch (axiosError) {
        console.warn('POST request failed:', axiosError);
        console.log('Trying alternative approach with URLSearchParams...');

        // Alternative approach using URLSearchParams
        const urlParams = new URLSearchParams();
        urlParams.append('apikey', ETHERSCAN_API_KEY);
        urlParams.append('module', 'contract');
        urlParams.append('action', 'verifysourcecode');
        urlParams.append('contractaddress', params.contractAddress);
        urlParams.append('sourceCode', params.sourceCode);
        urlParams.append('codeformat', 'solidity-single-file');
        urlParams.append('contractname', params.contractName);
        urlParams.append('compilerversion', params.compilerVersion);
        urlParams.append('optimizationUsed', params.optimizationUsed ? '1' : '0');
        urlParams.append('runs', (params.runs || 200).toString());
        urlParams.append('constructorArguements', params.constructorArguments);
        urlParams.append('licenseType', '3'); // MIT License

        const fetchResponse = await fetch(etherscanApiUrl, {
          method: 'POST',
          body: urlParams,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }

        const data = await fetchResponse.json();
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

  // Helper function to check verification status
  const checkVerificationStatus = async (
    guid: string,
    apiUrl: string,
    retryCount = 0,
  ): Promise<{ status: string; message: string }> => {
    try {
      console.log(`Checking verification status (attempt ${retryCount + 1})...`);

      // Wait a bit to allow verification to process
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const params = new URLSearchParams({
        apikey: ETHERSCAN_API_KEY,
        module: 'contract',
        action: 'checkverifystatus',
        guid,
      });

      console.log(
        `Verification status check URL: ${apiUrl}?module=contract&action=checkverifystatus&guid=${guid.substring(0, 8)}...`,
      );

      // Use POST method as required by Etherscan
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Verification status check response:', data);

      if (data.status === '1') {
        return { status: 'success', message: 'Contract successfully verified' };
      } else if (data.result === 'Pending in queue') {
        // Still in queue, try checking again
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
