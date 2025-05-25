import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/routers/root";

// export const runtime = "edge";

const handler = async (req: Request) => {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

  const modifiedResponse = new Response(response.body, response);
  modifiedResponse.headers.set("Access-Control-Allow-Origin", origin);
  modifiedResponse.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  modifiedResponse.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return modifiedResponse;
};

export { handler as GET, handler as POST, handler as OPTIONS };
