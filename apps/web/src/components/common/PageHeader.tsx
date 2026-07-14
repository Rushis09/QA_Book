import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  actionLabel,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">
          {title}
        </Typography>

        <Button
          variant="contained"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </Box>

      {children}
    </>
  );
}