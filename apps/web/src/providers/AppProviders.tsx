import type { ReactNode } from "react";

import { AuthProvider } from "../contexts/AuthContext";
import NotificationProvider from "../contexts/NotificationProvider";
import { WorkspaceProvider } from "../contexts/WorkspaceContext";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}