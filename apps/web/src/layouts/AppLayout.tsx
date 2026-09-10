import { Box, LinearProgress } from "@mui/material";
import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useGlobalLoading } from "../providers/AppProviders";

export default function AppLayout() {
  const { isLoading } = useGlobalLoading();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Header />

      <Box
        sx={{
          height: 2,
          flexShrink: 0,
          position: "relative",
          zIndex: 1200,
        }}
      >
        {isLoading && (
          <LinearProgress
            sx={{
              height: 2,
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "auto",

            px: {
              xs: 1.25,
              sm: 1.5,
              md: 1.75,
              lg: 2,
            },

            py: {
              xs: 1.25,
              sm: 1.5,
              md: 1.5,
              lg: 1.75,
            },

            "&::-webkit-scrollbar": {
              width: 7,
              height: 7,
            },

            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#d6dee9",
              borderRadius: 10,
            },

            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#bdc8d6",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}