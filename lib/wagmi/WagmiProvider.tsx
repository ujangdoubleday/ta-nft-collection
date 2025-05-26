'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect, useState } from 'react'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { config } from './config'

interface WagmiProviderProps {
  children: ReactNode
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  // Only show the app UI when it's mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProviderBase>
  )
} 