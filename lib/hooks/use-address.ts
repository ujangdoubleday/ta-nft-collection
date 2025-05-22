"use client";

import { useWallet } from "@/components/features/wallet/hooks/useWallet";
import { useState, useEffect } from "react";

export function useAddress() {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // When address changes, reset loading state
    setIsLoading(false);
  }, [address]);

  return {
    data: address,
    isLoading,
    error,
  };
}
