import { useEffect, useState } from "react";

import {
  BugReportOutlined,
  PlayArrowOutlined,
  SmartToyOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Radio,
  Typography,
} from "@mui/material";

import type { Bug } from "../../types/bug";

interface BugRetestDialogProps {
  open: boolean;
  bug?: Bug;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (
    executionType:
      | "Manual"
      | "Automated",
  ) => Promise<void>;
}

function getSeverityStyles(
  severity: string,
) {
  switch (severity) {
    case "Critical":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "High":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    case "Medium":
      return {
        color: "#175cd3",
        backgroundColor: "#eff8ff",
        borderColor: "#b2ddff",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

function getStatusStyles(
  status: string,
) {
  switch (status) {
    case "Fixed":
      return {
        color: "#175cd3",
        backgroundColor: "#eff8ff",
        borderColor: "#b2ddff",
      };

    case "Ready for QA":
      return {
        color: "#067647",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

function ContextItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.05,
        py: 0.85,
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        border:
          "1px solid #eaecf0",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.58rem",
          fontWeight: 800,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.045em",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: "0.7rem",
          fontWeight: 650,
          color: "#344054",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

interface ExecutionOptionProps {
  selected: boolean;
  value: "Manual" | "Automated";
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function ExecutionOption({
  selected,
  value,
  title,
  description,
  icon,
  onClick,
}: ExecutionOptionProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        textAlign: "left",
        cursor: "pointer",
        borderRadius: "9px",
        border: selected
          ? "1px solid #84adff"
          : "1px solid #d0d5dd",
        backgroundColor: selected
          ? "#f5f9ff"
          : "#fff",
        px: 1.15,
        py: 1.05,
        transition:
          "border-color 120ms ease, background-color 120ms ease",
        "&:hover": {
          borderColor: "#98b9f5",
          backgroundColor:
            "#f8fbff",
        },
      }}
    >
      <Radio
        checked={selected}
        value={value}
        size="small"
        sx={{
          p: 0.1,
          mt: 0.05,
          color: "#98a2b3",
          "&.Mui-checked": {
            color: "#1570ef",
          },
        }}
        
      />

      <Box
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "7px",
          backgroundColor: selected
            ? "#eaf2ff"
            : "#f2f4f7",
          color: selected
            ? "#1570ef"
            : "#667085",
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.74rem",
            fontWeight: 800,
            color: "#101828",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            fontSize: "0.63rem",
            lineHeight: 1.4,
            color: "#667085",
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

export default function BugRetestDialog({
  open,
  bug,
  saving = false,
  onClose,
  onConfirm,
}: BugRetestDialogProps) {
  const [
    executionType,
    setExecutionType,
  ] = useState<
    "Manual" | "Automated"
  >("Manual");

  useEffect(() => {
    if (open) {
      setExecutionType("Manual");
    }
  }, [open]);

  async function handleConfirm() {
    await onConfirm(
      executionType,
    );
  }

  const severityStyles = bug
    ? getSeverityStyles(
        bug.severity,
      )
    : getSeverityStyles("");

  const statusStyles = bug
    ? getStatusStyles(
        bug.status,
      )
    : getStatusStyles("");

  return (
    <Dialog
      open={open}
      onClose={
        saving
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 20px 50px rgba(16, 24, 40, 0.18)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2.1,
          py: 1.35,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              backgroundColor: "#eff8ff",
              color: "#1570ef",
            }}
          >
            <BugReportOutlined
              sx={{
                fontSize: 19,
              }}
            />
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.95rem",
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#101828",
              }}
            >
              Start Bug Retest
            </Typography>

            <Typography
              sx={{
                mt: 0.2,
                fontSize: "0.65rem",
                color: "#667085",
              }}
            >
              Verify whether the reported defect
              has been resolved.
            </Typography>
          </Box>

          {bug && (
            <Typography
              sx={{
                ml: "auto",
                flexShrink: 0,
                fontSize: "0.67rem",
                fontWeight: 800,
                color: "#175cd3",
                backgroundColor: "#eff8ff",
                border:
                  "1px solid #b2ddff",
                borderRadius: "7px",
                px: 0.9,
                py: 0.5,
              }}
            >
              {bug.bug_code}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 2.1,
          py: 1.7,
          backgroundColor: "#f8fafc",
        }}
      >
        {bug && (
          <>
            {/* DEFECT CONTEXT */}
            <Box sx={{ mb: 1.8 }}>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  color: "#667085",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.055em",
                  mb: 0.7,
                }}
              >
                Defect
              </Typography>

              <Box
                sx={{
                  p: 1.1,
                  borderRadius: "9px",
                  border:
                    "1px solid #d0d5dd",
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#101828",
                  }}
                >
                  {bug.title}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    flexWrap: "wrap",
                    mt: 0.7,
                  }}
                >
                  <Chip
                    label={bug.severity}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: "6px",
                      fontSize: "0.6rem",
                      fontWeight: 750,
                      color:
                        severityStyles.color,
                      backgroundColor:
                        severityStyles.backgroundColor,
                      border:
                        `1px solid ${severityStyles.borderColor}`,
                    }}
                  />

                  <Chip
                    label={bug.priority}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: "6px",
                      fontSize: "0.6rem",
                      fontWeight: 750,
                      color: "#475467",
                      backgroundColor:
                        "#f2f4f7",
                      border:
                        "1px solid #e4e7ec",
                    }}
                  />

                  <Chip
                    label={bug.status}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: "6px",
                      fontSize: "0.6rem",
                      fontWeight: 750,
                      color:
                        statusStyles.color,
                      backgroundColor:
                        statusStyles.backgroundColor,
                      border:
                        `1px solid ${statusStyles.borderColor}`,
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* TEST CASE */}
            <Box sx={{ mb: 1.8 }}>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  color: "#667085",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.055em",
                  mb: 0.7,
                }}
              >
                Test Case
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 0.7fr) minmax(0, 1.8fr)",
                  gap: 0.7,
                }}
              >
                <ContextItem
                  label="Code"
                  value={
                    bug.execution
                      .test_case
                      .test_case_code
                  }
                />

                <ContextItem
                  label="Test Case"
                  value={
                    bug.execution
                      .test_case
                      .title
                  }
                />
              </Box>
            </Box>
          </>
        )}

        <Divider
          sx={{
            mb: 1.7,
            borderColor: "#eaecf0",
          }}
        />

        {/* EXECUTION METHOD */}
        <Box>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 800,
              color: "#667085",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.055em",
            }}
          >
            Retest Method
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              fontSize: "0.84rem",
              fontWeight: 800,
              color: "#101828",
            }}
          >
            Choose how this defect should be
            retested
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              mb: 0.9,
              fontSize: "0.65rem",
              color: "#667085",
            }}
          >
            The selected method determines the
            type of Test Run created for this retest.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: 0.9,
            }}
          >
            <ExecutionOption
              selected={
                executionType === "Manual"
              }
              value="Manual"
              title="Manual"
              description="Execute the test yourself and record the result."
              icon={
                <PlayArrowOutlined
                  sx={{
                    fontSize: 18,
                  }}
                />
              }
              onClick={() =>
                setExecutionType(
                  "Manual",
                )
              }
            />

            <ExecutionOption
              selected={
                executionType ===
                "Automated"
              }
              value="Automated"
              title="Automated"
              description="Run the test through the configured automation workflow."
              icon={
                <SmartToyOutlined
                  sx={{
                    fontSize: 18,
                  }}
                />
              }
              onClick={() =>
                setExecutionType(
                  "Automated",
                )
              }
            />
          </Box>
        </Box>

        {/* WHAT WILL HAPPEN */}
        <Box
          sx={{
            mt: 1.4,
            px: 1.1,
            py: 1,
            borderRadius: "8px",
            backgroundColor: "#f0f9ff",
            border:
              "1px solid #b9e6fe",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.61rem",
              fontWeight: 800,
              color: "#026aa2",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.045em",
            }}
          >
            What will happen
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: "0.66rem",
              lineHeight: 1.5,
              color: "#344054",
            }}
          >
            A new{" "}
            <strong>Test Run</strong>{" "}
            and{" "}
            <strong>Test Execution</strong>{" "}
            will be created for this bug's test
            case using the selected execution method.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.1,
          py: 1.1,
          gap: 0.7,
          borderTop:
            "1px solid #eaecf0",
          backgroundColor: "#fff",
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            minHeight: 34,
            px: 1.5,
            borderRadius: "8px",
            fontSize: "0.72rem",
            fontWeight: 750,
            textTransform: "none",
            color: "#475467",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            saving || !bug
          }
          sx={{
            minHeight: 34,
            px: 1.7,
            borderRadius: "8px",
            fontSize: "0.72rem",
            fontWeight: 750,
            textTransform: "none",
            boxShadow:
              "0 1px 2px rgba(16,24,40,0.12)",
          }}
        >
          {saving
            ? "Creating..."
            : "Start Retest"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}