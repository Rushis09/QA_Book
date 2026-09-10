import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { TraceabilityAnalyticsItem } from "../../types/report";

interface TraceabilityTableProps {
  traceability: TraceabilityAnalyticsItem[];
}

function riskTone(level: string) {
  switch (level.toUpperCase()) {
    case "HIGH":
      return {
        backgroundColor: "#fef3f2",
        color: "#b42318",
      };
    case "MEDIUM":
      return {
        backgroundColor: "#fffaeb",
        color: "#b54708",
      };
    default:
      return {
        backgroundColor: "#ecfdf3",
        color: "#027a48",
      };
  }
}

function statusTone(status: string) {
  switch (status.toLowerCase()) {
    case "passed":
      return {
        backgroundColor: "#ecfdf3",
        color: "#027a48",
      };
    case "failed":
      return {
        backgroundColor: "#fef3f2",
        color: "#b42318",
      };
    case "blocked":
      return {
        backgroundColor: "#fffaeb",
        color: "#b54708",
      };
    default:
      return {
        backgroundColor: "#f2f4f7",
        color: "#475467",
      };
  }
}

export default function TraceabilityTable({
  traceability,
}: TraceabilityTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid #e4e7ec",
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)",
        overflowX: "auto",
        overflow: "hidden",
      }}
    >
      <Typography
        sx={{
          px: 1.65,
          pt: 1.5,
          pb: 0.35,
          fontSize: "0.92rem",
          fontWeight: 750,
          color: "#101828",
          letterSpacing: "-0.015em",
        }}
      >
        Traceability Matrix
      </Typography>

      <Typography
        sx={{
          px: 1.65,
          pb: 1.15,
          fontSize: "0.7rem",
          color: "#667085",
        }}
      >
        Requirement → Scenario → Test Case → Execution → Bug.
      </Typography>

      <Table
        size="small"
        sx={{ minWidth: 900 }}
      >
        <TableHead>
          <TableRow>
            {[
              "Requirement",
              "Scenario",
              "Test Case",
              "Module",
              "Priority",
              "Execution",
              "Run",
              "Bug",
              "Risk",
            ].map((heading) => (
              <TableCell
                key={heading}
                sx={{
                  py: 0.7,
                  px: 1,
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #eef2f6",
                  fontSize: "0.63rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                }}
              >
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {traceability.length ? (
            traceability.map((item, index) => (
              <TableRow
                key={`${item.test_case_code}-${index}`}
                hover
              >
                <TableCell
                  sx={{
                    fontSize: "0.69rem",
                    fontWeight: 700,
                    color: "#101828",
                  }}
                >
                  {item.requirement_code}
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.69rem",
                    color: "#344054",
                  }}
                >
                  {item.scenario_code}
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.69rem",
                    fontWeight: 650,
                  }}
                >
                  {item.test_case_code}
                </TableCell>

                <TableCell sx={{ fontSize: "0.69rem" }}>
                  {item.module}
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.priority}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.61rem",
                      fontWeight: 700,
                      backgroundColor:
                        item.priority.toLowerCase() === "high"
                          ? "#fef3f2"
                          : item.priority.toLowerCase() === "medium"
                            ? "#fffaeb"
                            : "#f2f4f7",
                      color:
                        item.priority.toLowerCase() === "high"
                          ? "#b42318"
                          : item.priority.toLowerCase() === "medium"
                            ? "#b54708"
                            : "#475467",
                    }}
                  />
                </TableCell>

                <TableCell>
                  {item.execution_status ? (
                    <Chip
                      label={item.execution_status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.61rem",
                        fontWeight: 700,
                        ...statusTone(
                          item.execution_status,
                        ),
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "0.67rem",
                        color: "#667085",
                      }}
                    >
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.67rem",
                    fontWeight: 650,
                  }}
                >
                  {item.run_code ?? "-"}
                </TableCell>

                <TableCell>
                  {item.bug_code ? (
                    <Chip
                      label={item.bug_code}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.61rem",
                        fontWeight: 700,
                        backgroundColor: "#fef3f2",
                        color: "#b42318",
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "0.67rem",
                        color: "#667085",
                      }}
                    >
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.risk_level}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.61rem",
                      fontWeight: 750,
                      ...riskTone(item.risk_level),
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                sx={{
                  py: 4,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "#667085",
                  }}
                >
                  No traceability data available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}