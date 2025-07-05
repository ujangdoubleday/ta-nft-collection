import { router } from '@/lib/api/trpc/server';
import { nftRouter } from '@/lib/api/trpc/routers/nft';
import { collectionRouter } from '@/lib/api/trpc/routers/collection';
import { uploadRouter } from '@/lib/api/trpc/routers/upload';
import { redisRouter } from './redis';
import { factoryConfigRouter } from './factory-config';
import { blocklistRouter } from './blocklist';
import { userRouter } from './user';

export const appRouter = router({
  nft: nftRouter,
  collection: collectionRouter,
  upload: uploadRouter,
  redis: redisRouter,
  factoryConfig: factoryConfigRouter,
  blocklist: blocklistRouter,
  user: userRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
