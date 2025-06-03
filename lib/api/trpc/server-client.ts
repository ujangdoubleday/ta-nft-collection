import { appRouter } from '@/lib/api/trpc/routers/root';

/**
 * Server-side tRPC client for use in server components
 * This allows us to call tRPC procedures directly from server components
 *
 * We need to ensure that any data returned is serializable for Next.js
 */
export const serverClient = appRouter.createCaller({});

// Helper function to make data serializable (remove Set objects)
export function makeSerializable<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
