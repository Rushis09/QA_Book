import {
  Box,
  Button,
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
          mb: 1.5,
          minHeight: 38,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.45rem",
            lineHeight: 1.2,
            fontWeight: 750,
            letterSpacing: "-0.035em",
            color: "#111827",
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {selectionCount && selectionCount > 0 ? (
            <>
              <Typography
                sx={{
                  mr: 0.5,
                  fontSize: "0.78rem",
                  fontWeight: 650,
                  color: "#475467",
                }}
              >
                {selectionCount} Selected
              </Typography>

              {selectionActions?.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant ?? "contained"}
                  color={action.color ?? "primary"}
                  onClick={action.onClick}
                  size="small"
                  sx={{
                    minHeight: 34,
                    px: 1.5,
                    borderRadius: "8px",
                    fontSize: "0.76rem",
                    fontWeight: 650,
                    textTransform: "none",
                    boxShadow: "none",
                  }}
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
                    size="small"
                    sx={{
                      minHeight: 34,
                      px: 1.5,
                      borderRadius: "8px",
                      fontSize: "0.76rem",
                      fontWeight: 650,
                      textTransform: "none",
                      borderColor: "#d0d5dd",
                      color: "#344054",
                    }}
                  >
                    {secondaryActionLabel}
                  </Button>
                )}

              <Button
                variant="contained"
                onClick={onAction}
                size="small"
                sx={{
                  minHeight: 34,
                  px: 1.6,
                  borderRadius: "8px",
                  fontSize: "0.76rem",
                  fontWeight: 650,
                  textTransform: "none",
                  boxShadow:
                    "0 3px 8px rgba(22,119,255,0.16)",
                }}
              >
                {actionLabel}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {children}
    </>
  );
}