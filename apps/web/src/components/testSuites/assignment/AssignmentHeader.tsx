import {
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import type { TestSuite } from "../../../types/testSuite";

interface AssignmentHeaderProps {
  suite: TestSuite;
  assignedCount: number;
  onSave: () => void;
  saving: boolean;
}

export default function AssignmentHeader({
  suite,
  assignedCount,
  onSave,
  saving,
}: AssignmentHeaderProps) {
  const isActive =
    suite.status.toLowerCase() ===
    "active";

  return (
    <Box
      sx={{
        mb: 1.75,
        border: "1px solid #dbe5f0",
        borderRadius: "12px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #ffffff 72%)",
      }}
    >
      {/* Top Accent */}
      <Box
        sx={{
          height: 3,
          backgroundColor: "#356dff",
        }}
      />

      <Box
        sx={{
          px: {
            xs: 1.5,
            sm: 2,
          },
          py: {
            xs: 1.4,
            sm: 1.6,
          },
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent:
              "space-between",
            gap: 2,
            flexDirection: {
              xs: "column",
              sm: "row",
            },
          }}
        >
          {/* Context */}
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Eyebrow */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                mb: 0.65,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.61rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.07em",
                }}
              >
                Test Suite
              </Typography>

              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: 12,
                  color: "#98a2b3",
                }}
              />

              <Typography
                sx={{
                  fontSize: "0.61rem",
                  fontWeight: 700,
                  color: "#356dff",
                  letterSpacing:
                    "0.03em",
                }}
              >
                Assignment
              </Typography>
            </Box>

            {/* Title + Status */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "1rem",
                    sm: "1.12rem",
                  },
                  fontWeight: 750,
                  lineHeight: 1.2,
                  letterSpacing:
                    "-0.025em",
                  color: "#101828",
                }}
              >
                Assign Test Cases
              </Typography>

              <Chip
                label={suite.status}
                size="small"
                sx={{
                  height: 22,
                  borderRadius: "6px",
                  backgroundColor:
                    isActive
                      ? "#ecfdf3"
                      : "#f2f4f7",
                  color: isActive
                    ? "#027a48"
                    : "#475467",
                  border: isActive
                    ? "1px solid #abefc6"
                    : "1px solid #e4e7ec",
                  fontSize: "0.61rem",
                  fontWeight: 700,
                }}
              />
            </Box>

            {/* Suite Identity */}
            <Box
              sx={{
                mt: 0.55,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.77rem",
                  fontWeight: 700,
                  color: "#344054",
                }}
              >
                {suite.name}
              </Typography>

              <Chip
                label={suite.suite_code}
                size="small"
                sx={{
                  height: 21,
                  borderRadius: "5px",
                  backgroundColor:
                    "#ffffff",
                  color: "#475467",
                  border:
                    "1px solid #d0d5dd",
                  fontSize: "0.59rem",
                  fontWeight: 700,
                }}
              />
            </Box>

            {/* Description */}
            {suite.description && (
              <Typography
                sx={{
                  mt: 0.45,
                  maxWidth: 760,
                  fontSize: "0.67rem",
                  color: "#667085",
                  lineHeight: 1.45,
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                  display:
                    "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient:
                    "vertical",
                }}
                title={suite.description}
              >
                {suite.description}
              </Typography>
            )}
          </Box>

          {/* Save Action */}
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saving}
            startIcon={
              <SaveOutlinedIcon
                sx={{
                  fontSize: 16,
                }}
              />
            }
            sx={{
              flexShrink: 0,
              minWidth: 146,
              height: 37,
              px: 1.6,
              borderRadius: "8px",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "none",
              boxShadow:
                "0 1px 2px rgba(16,24,40,0.08)",
              "&:hover": {
                boxShadow:
                  "0 2px 4px rgba(16,24,40,0.12)",
              },
            }}
          >
            {saving
              ? "Saving..."
              : "Save Assignment"}
          </Button>
        </Box>

        {/* Composition Context */}
        <Box
          sx={{
            mt: 1.35,
            pt: 1,
            borderTop:
              "1px solid #e4e7ec",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.63rem",
              fontWeight: 650,
              color: "#667085",
            }}
          >
            Current suite composition
          </Typography>

          <Chip
            label={`${assignedCount} ${
              assignedCount === 1
                ? "test case"
                : "test cases"
            } assigned`}
            size="small"
            sx={{
              height: 22,
              borderRadius: "6px",
              backgroundColor:
                "#eff8ff",
              color: "#175cd3",
              border:
                "1px solid #b2ddff",
              fontSize: "0.61rem",
              fontWeight: 700,
            }}
          />

          <Typography
            sx={{
              fontSize: "0.61rem",
              color: "#98a2b3",
            }}
          >
            Changes are applied when
            you save the assignment.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}