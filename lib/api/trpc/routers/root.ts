import { router } from '@/lib/api/trpc/server';
import { nftRouter } from '@/lib/api/trpc/routers/nft';
import { collectionRouter } from '@/lib/api/trpc/routers/collection';
import { uploadRouter } from '@/lib/api/trpc/routers/upload';

export const appRouter = router({
  nft: nftRouter,
  collection: collectionRouter,
  upload: uploadRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
