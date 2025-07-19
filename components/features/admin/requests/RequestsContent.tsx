'use client';

import React, { useState, useEffect } from 'react';
import { RequestsHeader } from './RequestsHeader';
import { RequestsTable } from './RequestsTable';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

export function RequestsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  // Get all requests from tRPC
  const {
    data: allRequests,
    isLoading: isLoadingRequests,
    refetch,
  } = trpc.request.getAllRequests.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Invalidate the query cache
      utils.request.getAllRequests.invalidate();

      // Refetch data
      await refetch();

      // Revalidate the requests page
      await fetch('/api/revalidate?path=/admin/requests&type=page');
      router.refresh();

      toast.success('Requests refreshed successfully');
    } catch (err) {
      console.error('Error refreshing requests:', err);
      toast.error('Failed to refresh requests. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // Filter requests based on search term (address or email)
  const filteredRequests =
    allRequests?.filter(
      (request) =>
        request.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in">
      <RequestsHeader />

      <div className="mt-8 border-t border-zinc-800 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by address or email..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <RequestsTable requests={filteredRequests} isLoading={isLoading || isLoadingRequests} />
      </div>
    </div>
  );
}
