import { z } from 'zod';
import { publicProcedure, router } from '../server';
import { requestRedis } from '@/lib/api/services/redis';
import { redis } from '@/lib/api/services/redis/config';

// Valid characters for Ethereum address (0-9, a-f, A-F)
const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]*$/;
const ETH_ADDRESS_LENGTH = 42; // 0x + 40 hex characters

export const requestRouter = router({
  // Submit a new request
  submitRequest: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email format'),
        address: z
          .string()
          .regex(ETH_ADDRESS_REGEX, 'Invalid Ethereum address format')
          .length(ETH_ADDRESS_LENGTH, 'Ethereum address must be 42 characters long'),
      }),
    )
    .mutation(async ({ input }) => {
      const { email, address } = input;

      // Check if request already exists
      const exists = await requestRedis.checkRequestExists(address);
      if (exists) {
        return {
          success: false,
          message: 'This address has already submitted a request',
        };
      }

      // Store new request with status pending
      const requestData = {
        email,
        address: address.toLowerCase(),
        status: 'pending' as const,
        timestamp: new Date().toISOString(),
      };

      const success = await requestRedis.setRequestData(requestData);

      return {
        success,
        message: success ? 'Request submitted successfully' : 'Failed to submit request',
      };
    }),

  // Check if address has already submitted a request
  checkRequest: publicProcedure
    .input(
      z.object({
        address: z
          .string()
          .regex(ETH_ADDRESS_REGEX, 'Invalid Ethereum address format')
          .length(ETH_ADDRESS_LENGTH, 'Ethereum address must be 42 characters long'),
      }),
    )
    .query(async ({ input }) => {
      const { address } = input;

      const requestData = await requestRedis.getRequestData(address);

      return {
        exists: !!requestData,
        data: requestData,
      };
    }),

  // Get all requests
  getAllRequests: publicProcedure.query(async () => {
    try {
      // Get all keys with pattern "request:*"
      const keys = await redis.keys('request:*');

      if (!keys || keys.length === 0) {
        return [];
      }

      // Get all request data
      const requests = [];
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          requests.push(JSON.parse(data as string));
        }
      }

      // Sort by timestamp (newest first)
      return requests.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      console.error('Error getting all requests:', error);
      return [];
    }
  }),

  // Update request status
  updateRequestStatus: publicProcedure
    .input(
      z.object({
        address: z
          .string()
          .regex(ETH_ADDRESS_REGEX, 'Invalid Ethereum address format')
          .length(ETH_ADDRESS_LENGTH, 'Ethereum address must be 42 characters long'),
        status: z.enum(['pending', 'approved', 'rejected']),
      }),
    )
    .mutation(async ({ input }) => {
      const { address, status } = input;

      // Get current request data
      const requestData = await requestRedis.getRequestData(address);

      if (!requestData) {
        throw new Error('Request not found');
      }

      // Update status
      const updatedData = {
        ...requestData,
        status,
      };

      const success = await requestRedis.setRequestData(updatedData);

      if (!success) {
        throw new Error('Failed to update request status');
      }

      return { success: true };
    }),

  // Delete request
  deleteRequest: publicProcedure
    .input(
      z.object({
        address: z
          .string()
          .regex(ETH_ADDRESS_REGEX, 'Invalid Ethereum address format')
          .length(ETH_ADDRESS_LENGTH, 'Ethereum address must be 42 characters long'),
      }),
    )
    .mutation(async ({ input }) => {
      const { address } = input;

      // Generate key for request
      const key = `request:${address.toLowerCase()}`;

      try {
        // Delete from Redis
        await redis.del(key);
        return { success: true };
      } catch (error) {
        console.error('Error deleting request:', error);
        throw new Error('Failed to delete request');
      }
    }),
});
