import {
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Snackbar,
} from "@mui/material";

import type { AlertColor } from "@mui/material/Alert";

import NotificationContext from "./NotificationContext";

import type { NotificationSeverity } from "./NotificationContext";

interface NotificationProviderProps {
  children: ReactNode;
}

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] =
    useState<NotificationSeverity>("info");

  const value = useMemo(
    () => ({
      showNotification(
        text: string,
        type: NotificationSeverity = "info"
      ) {
        setMessage(text);
        setSeverity(type);
        setOpen(true);
      },
    }),
    []
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={severity as AlertColor}
          onClose={() => setOpen(false)}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}