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

import type { RequirementCoverageAnalytics } from "../../types/report";

interface RequirementCoverageTableProps {
  coverage: RequirementCoverageAnalytics[];
}

function coverageTone(value: number) {
  if (value >= 80) {
    return {
      backgroundColor: "#ecfdf3",
      color: "#027a48",
    };
  }

  if (value >= 50) {
    return {
      backgroundColor: "#fffaeb",
      color: "#b54708",
    };
  }

  return {
    backgroundColor: "#fef3f2",
    color: "#b42318",
  };
}

export default function RequirementCoverageTable({
  coverage,
}: RequirementCoverageTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid #e4e7ec",
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)",
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
        Requirement Coverage
      </Typography>

      <Typography
        sx={{
          px: 1.65,
          pb: 1.15,
          fontSize: "0.7rem",
          color: "#667085",
        }}
      >
        Requirement-level coverage and execution readiness.
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              "Requirement",
              "Module",
              "Priority",
              "Scenarios",
              "Test Cases",
              "Executed",
              "Coverage",
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
          {coverage.length ? (
            coverage.map((item) => (
              <TableRow
                key={item.requirement_code}
                hover
              >
                <TableCell
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#101828",
                  }}
                >
                  {item.requirement_code}
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.7rem",
                    color: "#344054",
                  }}
                >
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

                <TableCell
                  align="center"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {item.scenario_count}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {item.test_case_count}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {item.executed_test_case_count}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={`${Number(item.coverage).toFixed(1)}%`}
                    size="small"
                    sx={{
                      height: 21,
                      fontSize: "0.62rem",
                      fontWeight: 750,
                      ...coverageTone(item.coverage),
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
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
                  No requirement coverage data available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}