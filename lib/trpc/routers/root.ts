import { router } from '@/lib/trpc/server';
import { userRouter } from '@/lib/trpc/routers/user';
import { nftRouter } from '@/lib/trpc/routers/nft';
import { collectionRouter } from '@/lib/trpc/routers/collection';
import { todoRouter } from '@/lib/trpc/routers/todo';

export const appRouter = router({
  user: userRouter,
  nft: nftRouter,
  collection: collectionRouter,
  todo: todoRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
