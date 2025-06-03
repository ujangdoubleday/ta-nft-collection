import { appRouter } from '@/lib/api/trpc/routers/root';

/**
 * Server-side tRPC client for use in server components
 * This allows us to call tRPC procedures directly from server components
 *
 * We need to ensure that any data returned is serializable for Next.js
 */
export const serverClient = appRouter.createCaller({});

/**
 * Helper function to make data serializable for Next.js
 * Converts Sets to Arrays and handles other non-serializable objects
 */
export function makeSerializable<T>(obj: T): T {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj as any;
  }

  // Handle Set objects by converting to array
  if (obj instanceof Set) {
    return Array.from(obj) as any;
  }

  // Handle Map objects by converting to object
  if (obj instanceof Map) {
    const serialized = {};
    obj.forEach((value, key) => {
      (serialized as any)[String(key)] = makeSerializable(value);
    });
    return serialized as any;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => makeSerializable(item)) as any;
  }

  // Handle plain objects
  const serialized = {} as any;
  for (const [key, value] of Object.entries(obj as any)) {
    serialized[key] = makeSerializable(value);
  }

  return serialized;
}
