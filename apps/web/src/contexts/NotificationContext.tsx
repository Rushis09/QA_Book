import {
  createContext,
  useContext,
} from "react";

export type NotificationSeverity =
  | "success"
  | "error"
  | "warning"
  | "info";

export interface NotificationContextValue {
  showNotification: (
    message: string,
    severity?: NotificationSeverity
  ) => void;
}

const NotificationContext =
  createContext<NotificationContextValue | undefined>(
    undefined
  );

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used within NotificationProvider."
    );
  }

  return context;
}

export default NotificationContext;