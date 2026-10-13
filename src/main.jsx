import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { AuthProvider } from "@/context/AuthProvider.jsx";
import { WorkspaceProvider } from "@/context/WorkspaceProvider.jsx";
import AppRouter from "@/router/AppRouter.jsx";
import { Toaster } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkspaceProvider>
          <TooltipProvider>
            <AppRouter />
          </TooltipProvider>
          <Toaster />
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
