"use client";

import { ReactNode } from "react";
import { SessionProvider } from "./SessionProvider";
import { ToastProvider } from "./ToastProvider";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
