import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import "./index.css";
import App from "./App";
import AppProviders from "./providers/AppProviders";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
    >
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </LocalizationProvider>
  </StrictMode>,
);