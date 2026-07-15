import type { ReactNode } from "react";

import NotificationProvider from "../contexts/NotificationProvider";
import { AuthProvider } from "../contexts/AuthContext";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}