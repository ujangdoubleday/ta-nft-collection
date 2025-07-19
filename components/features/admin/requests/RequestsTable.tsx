'use client';

import React, { useState } from 'react';
import { Copy, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';

interface Request {
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

interface RequestsTableProps {
  requests: Request[];
  isLoading: boolean;
}

export function RequestsTable({ requests, isLoading }: RequestsTableProps) {
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();
  const utils = trpc.useUtils();

  // tRPC mutations
  const updateRequestMutation = trpc.request.updateRequestStatus.useMutation({
    onSuccess: () => {
      toast.success('Request status updated successfully');
      setProcessingRequest(null);

      // Invalidate queries to refresh data
      utils.request.getAllRequests.invalidate();

      // Revalidate the requests page
      fetch('/api/revalidate?path=/admin/requests&type=page')
        .then(() => {
          router.refresh();
        })
        .catch((err) => {
          console.error('Error revalidating requests page:', err);
        });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update request status');
      setProcessingRequest(null);
    },
  });

  // Delete request mutation
  const deleteRequestMutation = trpc.request.deleteRequest.useMutation({
    onSuccess: () => {
      toast.success('Request deleted successfully');
      setAddressToDelete(null);
      setDeleteDialogOpen(false);

      // Invalidate queries to refresh data
      utils.request.getAllRequests.invalidate();

      // Revalidate the requests page
      fetch('/api/revalidate?path=/admin/requests&type=page')
        .then(() => {
          router.refresh();
        })
        .catch((err) => {
          console.error('Error revalidating requests page:', err);
        });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete request');
      setAddressToDelete(null);
      setDeleteDialogOpen(false);
    },
  });

  // Copy address to clipboard
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy address');
      console.error('Failed to copy address:', error);
    }
  };

  // Approve request
  const handleApprove = async (address: string) => {
    setProcessingRequest(address);
    updateRequestMutation.mutate({
      address,
      status: 'approved',
    });
  };

  // Reject request
  const handleReject = async (address: string) => {
    setProcessingRequest(address);
    updateRequestMutation.mutate({
      address,
      status: 'rejected',
    });
  };

  // Open delete dialog
  const openDeleteDialog = (address: string) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  // Delete request
  const handleDelete = () => {
    if (!addressToDelete) return;

    deleteRequestMutation.mutate({
      address: addressToDelete,
    });
  };

  // Format timestamp
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-zinc-500/20 text-zinc-500';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-zinc-800 rounded-md p-4">
            <div className="h-5 bg-zinc-900 rounded w-2/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="border border-zinc-800 rounded-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-zinc-900">
            <tr>
              <th className="py-3 px-4 text-left text-white font-medium">No</th>
              <th className="py-3 px-4 text-left text-white font-medium">Email</th>
              <th className="py-3 px-4 text-left text-white font-medium">Address</th>
              <th className="py-3 px-4 text-left text-white font-medium">Status</th>
              <th className="py-3 px-4 text-left text-white font-medium">Date</th>
              <th className="py-3 px-4 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length > 0 ? (
              currentRequests.map((request, index) => (
                <tr key={request.address} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 text-white">{startIndex + index + 1}</td>
                  <td className="py-3 px-4 text-white">{request.email}</td>
                  <td className="py-3 px-4 font-mono text-sm text-white break-all">
                    {request.address}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadge(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white text-sm">{formatDate(request.timestamp)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => handleCopyAddress(request.address)}
                        size="sm"
                        className="hover:bg-zinc-800 p-2 h-8 w-8"
                        title="Copy Address"
                      >
                        <Copy size={16} className="text-white" />
                      </Button>

                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleApprove(request.address)}
                            disabled={!!processingRequest}
                            size="sm"
                            className="hover:bg-zinc-800 p-2 h-8 w-8"
                            title="Approve Request"
                          >
                            {processingRequest === request.address ? (
                              <Spinner size="sm" />
                            ) : (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={() => handleReject(request.address)}
                            disabled={!!processingRequest}
                            size="sm"
                            className="hover:bg-zinc-800 p-2 h-8 w-8"
                            title="Reject Request"
                          >
                            {processingRequest === request.address ? (
                              <Spinner size="sm" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => openDeleteDialog(request.address)}
                        disabled={!!processingRequest || deleteRequestMutation.isPending}
                        size="sm"
                        className="hover:bg-zinc-800 p-2 h-8 w-8"
                        title="Delete Request"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-zinc-400">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {requests.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent title="Delete Request" className="bg-black border border-zinc-800">
          <DialogHeader>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteRequestMutation.isPending}
              className="bg-transparent border-black text-white hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRequestMutation.isPending}
            >
              {deleteRequestMutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
