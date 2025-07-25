import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/api/trpc/routers/root';

// Configure for Next.js 15
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds timeout
export const runtime = 'nodejs';

const handler = async (req: Request) => {
  const origin = req.headers.get('origin') || '*';

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => ({}),
      // Allow method override to support POST requests for all operations
      allowMethodOverride: true,
      // Add timeout for Next.js 15
      onError: ({ error }) => {
        console.error('tRPC error:', error);
      },
    });

    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', origin);
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return modifiedResponse;
  } catch (error) {
    console.error('Error in tRPC handler:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    );
  }
};

export { handler as GET, handler as POST, handler as OPTIONS };
