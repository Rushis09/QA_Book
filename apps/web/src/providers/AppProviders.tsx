import type { ReactNode } from "react";

import NotificationProvider from "../contexts/NotificationProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}