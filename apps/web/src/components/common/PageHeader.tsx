import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import type { ButtonProps } from "@mui/material";

import type { ReactNode } from "react";

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
}

interface PageHeaderProps {
  title: string;

  actionLabel: string;
  onAction: () => void;

  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;

  children?: ReactNode;

  selectionCount?: number;

  selectionActions?: PageHeaderAction[];
}


export default function PageHeader({
  title,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  selectionCount,
  selectionActions,
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
          {selectionCount && selectionCount > 0 ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    alignSelf: "center",
                    mr: 1,
                  }}
                >
                  {selectionCount} Selected
                </Typography>
                
                {selectionActions?.map((action) => (
                  <Button
                    key={action.label}
                    variant={
                      action.variant ?? "contained"
                    }
                    color={
                      action.color ?? "primary"
                    }
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </>
            ) : (
            <>
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
            </>
          )}
        </Stack>
      </Box>

      {children}
    </>
  );
}