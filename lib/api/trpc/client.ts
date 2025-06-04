import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/lib/api/trpc/routers/root';

export const trpc = createTRPCReact<AppRouter>();
