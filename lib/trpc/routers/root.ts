import { router } from "../server";
import { userRouter } from "./user";
import { nftRouter } from "./nft";
import { collectionRouter } from "./collection";
import { todoRouter } from "./todo";

export const appRouter = router({
  user: userRouter,
  nft: nftRouter,
  collection: collectionRouter,
  todo: todoRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
