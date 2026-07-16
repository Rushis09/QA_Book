import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;

  actionLabel: string;
  onAction: () => void;

  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;

  children?: ReactNode;
}

export default function PageHeader({
  title,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
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

        <Stack
          direction="row"
          spacing={2}
        >
          {secondaryActionLabel &&
            onSecondaryAction && (
              <Button
                variant="outlined"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}

          <Button
            variant="contained"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </Stack>
      </Box>

      {children}
    </>
  );
}