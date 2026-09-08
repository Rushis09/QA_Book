import { useState } from "react";

import BugReportIcon from "@mui/icons-material/BugReport";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import type { TestExecution } from "../../types/testExecution";

interface TestExecutionTableItem
  extends TestExecution {
  execution_type: string;
}

interface TestExecutionTableProps {
  executions: TestExecutionTableItem[];
  onViewRun: (
    execution: TestExecutionTableItem,
  ) => void;
  onCreateBug: (
    execution: TestExecutionTableItem,
  ) => void;
}

function getStatusColor(
  status: string,
):
  | "default"
  | "success"
  | "error"
  | "warning" {
  switch (status) {
    case "Passed":
      return "success";

    case "Failed":
      return "error";

    case "Blocked":
      return "warning";

    default:
      return "default";
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Passed":
      return {
        color: "#067647",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    case "Failed":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "Blocked":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  const normalizedValue =
    /(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
      ? value
      : `${value}Z`;

  return new Date(
    normalizedValue,
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailBlock({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | null;
  fullWidth?: boolean;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth
          ? "1 / -1"
          : undefined,
        px: 1.2,
        py: 1,
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        border:
          "1px solid #eaecf0",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.63rem",
          fontWeight: 800,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.045em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.72rem",
          lineHeight: 1.5,
          color: "#344054",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value?.trim() || "-"}
      </Typography>
    </Box>
  );
}

export default function TestExecutionTable({
  executions,
  onViewRun,
  onCreateBug,
}: TestExecutionTableProps) {
  const [
    expandedExecutionId,
    setExpandedExecutionId,
  ] = useState<number | null>(null);

  function toggleExpanded(
    executionId: number,
  ) {
    setExpandedExecutionId(
      (current) =>
        current === executionId
          ? null
          : executionId,
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: "11px",
        borderColor: "#e4e7ec",
        boxShadow:
          "0 1px 2px rgba(16, 24, 40, 0.04)",
        overflow: "hidden",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 1050,
          "& .MuiTableCell-root": {
            borderColor: "#eaecf0",
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#f8fafc",
            }}
          >
            <TableCell
              sx={{
                width: 52,
                px: 1,
              }}
            />

            <TableCell sx={headerSx}>
              Execution
            </TableCell>

            <TableCell sx={headerSx}>
              Test Case
            </TableCell>

            <TableCell sx={headerSx}>
              Test Run
            </TableCell>

            <TableCell sx={headerSx}>
              Type
            </TableCell>

            <TableCell sx={headerSx}>
              Status
            </TableCell>
                        
            <TableCell sx={headerSx}>
              Actual Result
            </TableCell>
                        
            <TableCell sx={headerSx}>
              Executed By
            </TableCell>

            <TableCell sx={headerSx}>
              Executed At
            </TableCell>

            <TableCell
              align="right"
              sx={headerSx}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {executions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                align="center"
                sx={{
                  py: 5,
                  borderBottom: "none",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 750,
                      color: "#344054",
                    }}
                  >
                    No test executions found
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: "0.7rem",
                      color: "#98a2b3",
                    }}
                  >
                    Try adjusting your
                    search or filters.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            executions.map(
              (execution) => {
                const expanded =
                  expandedExecutionId ===
                  execution.id;

                const statusStyles =
                  getStatusStyles(
                    execution.status,
                  );

                return (
                  <>
                    <TableRow
                      key={execution.id}
                      hover
                      sx={{
                        backgroundColor:
                          expanded
                            ? "#fcfdff"
                            : "#ffffff",
                        "&:hover": {
                          backgroundColor:
                            "#f9fafb",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          px: 1,
                        }}
                      >
                        <Tooltip
                          title={
                            expanded
                              ? "Collapse details"
                              : "View execution details"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              toggleExpanded(
                                execution.id,
                              )
                            }
                            sx={{
                              width: 28,
                              height: 28,
                              border:
                                "1px solid #e4e7ec",
                              borderRadius:
                                "7px",
                              color:
                                "#667085",
                              backgroundColor:
                                "#ffffff",
                            }}
                          >
                            {expanded ? (
                              <ExpandLessIcon
                                sx={{
                                  fontSize: 17,
                                }}
                              />
                            ) : (
                              <ExpandMoreIcon
                                sx={{
                                  fontSize: 17,
                                }}
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.73rem",
                            fontWeight: 800,
                            color:
                              "#155eef",
                          }}
                        >
                          EX-
                          {execution.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.73rem",
                            fontWeight: 750,
                            color:
                              "#101828",
                          }}
                        >
                          {
                            execution
                              .test_case
                              .test_case_code
                          }
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.15,
                            maxWidth: 210,
                            fontSize:
                              "0.67rem",
                            color:
                              "#667085",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            execution
                              .test_case
                              .title
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.72rem",
                            fontWeight: 700,
                            color:
                              "#344054",
                          }}
                        >
                          {
                            execution
                              .test_run
                              .run_code
                          }
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.15,
                            maxWidth: 210,
                            fontSize:
                              "0.66rem",
                            color:
                              "#667085",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            execution
                              .test_run
                              .name
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            execution.execution_type
                          }
                          size="small"
                          sx={{
                            height: 23,
                            borderRadius:
                              "6px",
                            fontSize:
                              "0.64rem",
                            fontWeight: 700,
                            color:
                              "#475467",
                            backgroundColor:
                              "#f2f4f7",
                            border:
                              "1px solid #e4e7ec",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            execution.status
                          }
                          size="small"
                          color={getStatusColor(
                            execution.status,
                          )}
                          sx={{
                            height: 23,
                            borderRadius:
                              "6px",
                            fontSize:
                              "0.64rem",
                            fontWeight: 750,
                            color:
                              statusStyles.color,
                            backgroundColor:
                              statusStyles.backgroundColor,
                            border:
                              `1px solid ${statusStyles.borderColor}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            maxWidth: 190,
                            fontSize:
                              "0.68rem",
                            color:
                              "#475467",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            execution
                              .actual_result ||
                            "-"
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.68rem",
                            fontWeight: 650,
                            color:
                              execution.executed_by
                                ? "#344054"
                                : "#98a2b3",
                          }}
                        >
                          {execution.executed_by ||
                            "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.66rem",
                            color:
                              execution.executed_at
                                ? "#475467"
                                : "#98a2b3",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDateTime(
                            execution.executed_at,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        <Box
                          sx={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            alignItems:
                              "center",
                            gap: 0.25,
                          }}
                        >
                          <Tooltip title="Open Test Run">
                            <IconButton
                              size="small"
                              onClick={() =>
                                onViewRun(
                                  execution,
                                )
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                color:
                                  "#1570ef",
                                border:
                                  "1px solid #d0d5dd",
                                borderRadius:
                                  "7px",
                                backgroundColor:
                                  "#ffffff",
                              }}
                            >
                              <VisibilityIcon
                                sx={{
                                  fontSize: 17,
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          {execution.status ===
                            "Failed" && (
                            <Tooltip title="Create Bug">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  onCreateBug(
                                    execution,
                                  )
                                }
                                sx={{
                                  width: 30,
                                  height: 30,
                                  color:
                                    "#b42318",
                                  border:
                                    "1px solid #fecdca",
                                  borderRadius:
                                    "7px",
                                  backgroundColor:
                                    "#fffafa",
                                }}
                              >
                                <BugReportIcon
                                  sx={{
                                    fontSize: 17,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>

                    <TableRow
                      key={`${execution.id}-details`}
                    >
                      <TableCell
                        colSpan={9}
                        sx={{
                          p: 0,
                          borderBottom:
                            expanded
                              ? "1px solid #eaecf0"
                              : "none",
                        }}
                      >
                        <Collapse
                          in={expanded}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              px: 2,
                              py: 1.4,
                              backgroundColor:
                                "#fcfdff",
                              borderTop:
                                "1px solid #f2f4f7",
                            }}
                          >
                            <Box
                              sx={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  {
                                    xs: "1fr",
                                    md: "repeat(2, minmax(0, 1fr))",
                                  },
                                gap: 0.8,
                              }}
                            >
                              <DetailBlock
                                label="Preconditions"
                                value={
                                  execution
                                    .test_case
                                    .preconditions
                                }
                              />

                              <DetailBlock
                                label="Test Steps"
                                value={
                                  execution
                                    .test_case
                                    .steps
                                }
                              />

                              <DetailBlock
                                label="Expected Result"
                                value={
                                  execution
                                    .test_case
                                    .expected_result
                                }
                              />

                              <DetailBlock
                                label="Actual Result"
                                value={
                                  execution.actual_result
                                }
                              />

                              <DetailBlock
                                label="Execution Comments"
                                value={
                                  execution.comments
                                }
                                fullWidth
                              />
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                );
              },
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const headerSx = {
  py: 1,
  px: 1.25,
  fontSize: "0.64rem",
  fontWeight: 800,
  color: "#667085",
  textTransform: "uppercase" as const,
  letterSpacing: "0.045em",
  whiteSpace: "nowrap" as const,
};