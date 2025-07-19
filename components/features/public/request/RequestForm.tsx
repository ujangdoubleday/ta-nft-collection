'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc/client';
import Spinner from '@/components/ui/spinner';

// Valid characters for Ethereum address (0-9, a-f, A-F)
const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]*$/;
const ETH_ADDRESS_LENGTH = 42; // 0x + 40 hex characters

export function RequestForm() {
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emailError, setEmailError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC hooks
  const checkRequestQuery = trpc.request.checkRequest.useQuery(
    { address },
    {
      enabled: false,
      retry: false,
    },
  );

  const submitRequestMutation = trpc.request.submitRequest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        // Reset form
        setEmail('');
        setAddress('');
      } else {
        toast.error(data.message);
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit request');
      setIsSubmitting(false);
    },
  });

  // Validate email
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  // Validate address
  const validateAddress = (value: string) => {
    if (!value) {
      setAddressError('Ethereum address is required');
      return false;
    }

    if (!ETH_ADDRESS_REGEX.test(value)) {
      setAddressError('Invalid Ethereum address format');
      return false;
    }

    if (value.length !== ETH_ADDRESS_LENGTH) {
      setAddressError('Ethereum address must be 42 characters long');
      return false;
    }

    setAddressError('');
    return true;
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  // Handle address change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    if (addressError) validateAddress(value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isAddressValid = validateAddress(address);

    if (!isEmailValid || !isAddressValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if address already submitted a request
      const checkResult = await checkRequestQuery.refetch();

      if (checkResult.data?.exists) {
        toast.error('This address has already submitted a request');
        setIsSubmitting(false);
        return;
      }

      // Submit request
      submitRequestMutation.mutate({ email, address });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to check address status');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your@email.com"
            className="w-full bg-black border border-zinc-800 text-white placeholder:text-zinc-500 focus:border-white focus:ring-white text-sm sm:text-base"
            disabled={isSubmitting}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-xs sm:text-sm text-red-500 mt-1">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label htmlFor="address" className="block text-sm font-medium text-white">
            Ethereum Address
          </label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="0x123..."
            className="w-full bg-black border border-zinc-800 text-white placeholder:text-zinc-500 focus:border-white focus:ring-white text-sm sm:text-base"
            disabled={isSubmitting}
            aria-invalid={!!addressError}
            aria-describedby={addressError ? 'address-error' : undefined}
          />
          {addressError && (
            <p id="address-error" className="text-xs sm:text-sm text-red-500 mt-1">
              {addressError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black hover:bg-zinc-200 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black text-sm sm:text-base py-2 sm:py-2.5"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" color="black" />
              <span className="ml-2">Submitting...</span>
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </form>
    </div>
  );
}
