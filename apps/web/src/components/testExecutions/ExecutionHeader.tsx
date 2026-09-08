import {
  Box,
  Chip,
  Typography,
} from "@mui/material";

interface ExecutionHeaderProps {
  runCode: string;
  runName: string;
  suiteName: string;
  executionType: string;
  tester: string | null;
  environment: string | null;
  buildVersion: string | null;
  status: string;
}

export default function ExecutionHeader({
  runCode,
  runName,
  suiteName,
  executionType,
  tester,
  environment,
  buildVersion,
  status,
}: ExecutionHeaderProps) {
  function getStatusStyles() {
    switch (status) {
      case "Completed":
        return {
          background: "#ecfdf3",
          color: "#027a48",
          border: "#abefc6",
        };

      case "In Progress":
        return {
          background: "#fffaeb",
          color: "#b54708",
          border: "#fedf89",
        };

      case "Not Started":
        return {
          background: "#f2f4f7",
          color: "#475467",
          border: "#d0d5dd",
        };

      default:
        return {
          background: "#eff6ff",
          color: "#175cd3",
          border: "#b2ddff",
        };
    }
  }

  const statusStyles = getStatusStyles();

  const isAutomated =
    executionType === "Automated";

  return (
    <Box
      sx={{
        mb: 1.5,
        border: "1px solid #dbe4f0",
        borderRadius: "12px",
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
        overflow: "hidden",
      }}
    >
      {/* TOP CONTEXT */}
      <Box
        sx={{
          px: 1.75,
          py: 1.35,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderBottom: "1px solid #eaecf0",
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#eff6ff",
              border: "1px solid #d1e9ff",
              color: "#175cd3",
              fontSize: "0.68rem",
              fontWeight: 800,
            }}
          >
            RUN
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.7,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#175cd3",
                  letterSpacing: "0.025em",
                }}
              >
                {runCode}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.78rem",
                  color: "#98a2b3",
                }}
              >
                /
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 750,
                  color: "#101828",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: {
                    xs: 180,
                    sm: 360,
                    md: 520,
                  },
                }}
              >
                {runName}
              </Typography>
            </Box>

            <Typography
              sx={{
                mt: 0.2,
                fontSize: "0.66rem",
                color: "#667085",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {suiteName}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.65,
            flexShrink: 0,
          }}
        >
          <Chip
            label={executionType}
            size="small"
            sx={{
              height: 24,
              borderRadius: "7px",
              backgroundColor: isAutomated
                ? "#f5f3ff"
                : "#f2f4f7",
              color: isAutomated
                ? "#6941c6"
                : "#475467",
              border: isAutomated
                ? "1px solid #d9d6fe"
                : "1px solid #d0d5dd",
              fontSize: "0.63rem",
              fontWeight: 750,
            }}
          />

          <Chip
            label={status}
            size="small"
            sx={{
              height: 24,
              borderRadius: "7px",
              backgroundColor:
                statusStyles.background,
              color: statusStyles.color,
              border: `1px solid ${statusStyles.border}`,
              fontSize: "0.63rem",
              fontWeight: 750,
            }}
          />
        </Box>
      </Box>

      {/* RUN METADATA */}
      <Box
        sx={{
          px: 1.75,
          py: 1.15,
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 0,
        }}
      >
        <MetaItem
          label="Test Suite"
          value={suiteName}
          borderRight
        />

        <MetaItem
          label="Tester"
          value={tester || "-"}
          borderRight
        />

        <MetaItem
          label="Environment"
          value={environment || "-"}
          borderRight
        />

        <MetaItem
          label="Build"
          value={buildVersion || "-"}
        />
      </Box>
    </Box>
  );
}

interface MetaItemProps {
  label: string;
  value: string;
  borderRight?: boolean;
}

function MetaItem({
  label,
  value,
  borderRight = false,
}: MetaItemProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.25,
        "&:first-of-type": {
          pl: 0,
        },
        borderRight: borderRight
          ? "1px solid #eaecf0"
          : "none",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.6rem",
          lineHeight: 1.2,
          color: "#667085",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.035em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.7rem",
          lineHeight: 1.35,
          color: "#344054",
          fontWeight: 650,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value}
      >
        {value}
      </Typography>
    </Box>
  );
}