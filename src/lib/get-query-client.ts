import { QueryClient } from "@tanstack/react-query";

/**
 * A fresh QueryClient per server render, used only to prefetch + dehydrate.
 * staleTime matches the client (Providers) so the dehydrated data is still
 * considered fresh after hydration and the client does NOT refetch on load.
 */
export function getServerQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });
}
