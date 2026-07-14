import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
export default function AppLayout() {
  return (
    <Box sx={{ height: "100vh" }}>
      <Header />

      <Box sx={{ display: "flex" }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}