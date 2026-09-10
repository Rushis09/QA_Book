import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ThemeProvider } from "@mui/material/styles";

import { AuthProvider } from "../contexts/AuthContext";
import NotificationProvider from "../contexts/NotificationProvider";
import { WorkspaceProvider } from "../contexts/WorkspaceContext";
import theme from "../theme";

interface AppProvidersProps {
  children: ReactNode;
}

interface GlobalLoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const GlobalLoadingContext =
  createContext<GlobalLoadingContextValue | undefined>(
    undefined,
  );

export function useGlobalLoading(): GlobalLoadingContextValue {
  const context = useContext(GlobalLoadingContext);

  if (!context) {
    throw new Error(
      "useGlobalLoading must be used inside GlobalLoadingProvider",
    );
  }

  return context;
}

function GlobalLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((count) => Math.max(0, count - 1));
  }, []);

  useEffect(() => {
    const handleLoadingStart = () => {
      startLoading();
    };

    const handleLoadingStop = () => {
      stopLoading();
    };

    window.addEventListener(
      "qabook:api-loading-start",
      handleLoadingStart,
    );

    window.addEventListener(
      "qabook:api-loading-stop",
      handleLoadingStop,
    );

    return () => {
      window.removeEventListener(
        "qabook:api-loading-start",
        handleLoadingStart,
      );

      window.removeEventListener(
        "qabook:api-loading-stop",
        handleLoadingStop,
      );
    };
  }, [startLoading, stopLoading]);

  const value = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      startLoading,
      stopLoading,
    }),
    [loadingCount, startLoading, stopLoading],
  );

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <WorkspaceProvider>
          <NotificationProvider>
            <GlobalLoadingProvider>
              {children}
            </GlobalLoadingProvider>
          </NotificationProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}