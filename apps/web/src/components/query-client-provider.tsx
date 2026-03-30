import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { createAppQueryClient } from "@/lib/query-client";

interface AppQueryClientProviderProps {
  children: ReactNode;
}

export function AppQueryClientProvider({
  children,
}: AppQueryClientProviderProps) {
  const [client] = useState(createAppQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
