import { router } from '@/lib/api/trpc/server';
import { userRouter } from '@/lib/api/trpc/routers/user';
import { nftRouter } from '@/lib/api/trpc/routers/nft';
import { collectionRouter } from '@/lib/api/trpc/routers/collection';
import { todoRouter } from '@/lib/api/trpc/routers/todo';

export const appRouter = router({
  user: userRouter,
  nft: nftRouter,
  collection: collectionRouter,
  todo: todoRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
