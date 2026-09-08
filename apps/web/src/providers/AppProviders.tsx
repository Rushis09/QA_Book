import type { ReactNode } from "react";

import { ThemeProvider } from "@mui/material/styles";

import { AuthProvider } from "../contexts/AuthContext";
import NotificationProvider from "../contexts/NotificationProvider";
import { WorkspaceProvider } from "../contexts/WorkspaceContext";
import theme from "../theme";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <WorkspaceProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}