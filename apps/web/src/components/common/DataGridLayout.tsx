import { Box } from "@mui/material";

import type { ReactNode } from "react";

interface DataGridLayoutProps {
  children: ReactNode;
}

export default function DataGridLayout({
  children,
}: DataGridLayoutProps) {
  return (
    <Box
      sx={{
        height: "calc(100vh - 260px)",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {children}
    </Box>
  );
}