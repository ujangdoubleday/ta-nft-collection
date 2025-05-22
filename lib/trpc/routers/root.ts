import { router } from "../server";
import { userRouter } from "./user";
import { nftRouter } from "./nft";
import { collectionRouter } from "./collection";

export const appRouter = router({
  user: userRouter,
  nft: nftRouter,
  collection: collectionRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
