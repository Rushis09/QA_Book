import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
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

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useState } from "react";

import { getTestRunStatusColor } from "../../utils/testRunStatus";

import type { TestRun } from "../../types/testRun";

interface TestRunTableProps {
  testRuns: TestRun[];
  onEdit: (testRun: TestRun) => void;
  onDelete: (testRun: TestRun) => void;
  onExecute: (testRun: TestRun) => void;
  onViewDetails: (testRun: TestRun) => void;
  onCopyToken: (testRun: TestRun) => void;
  canExecute: (testRun: TestRun) => boolean;
}

export default function TestRunTable({
  testRuns,
  onEdit,
  onDelete,
  onExecute,
  onViewDetails,
  onCopyToken,
  canExecute,
}: TestRunTableProps) {
  const [menuAnchor, setMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [menuTestRun, setMenuTestRun] =
    useState<TestRun | null>(null);

  function openMenu(
    event: React.MouseEvent<HTMLElement>,
    testRun: TestRun,
  ) {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuTestRun(testRun);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuTestRun(null);
  }

  function handleMenuAction(
    action: () => void,
  ) {
    closeMenu();
    action();
  }

  function getExecutionTypeSx(
    executionType: string,
  ) {
    const normalized =
      executionType.trim().toLowerCase();

    if (normalized === "automated") {
      return {
        backgroundColor: "#f4f3ff",
        color: "#5925dc",
        border: "1px solid #d9d6fe",
      };
    }

    return {
      backgroundColor: "#f2f4f7",
      color: "#475467",
      border: "1px solid #e4e7ec",
    };
  }

  function getExecuteTooltip(
    testRun: TestRun,
    executable: boolean,
  ) {
    const executionType =
      testRun.execution_type
        .trim()
        .toLowerCase();

    if (executionType === "automated") {
      return "Automated runs are executed through QABook automation";
    }

    if (!executable) {
      return "Cannot execute: Test Suite has no test cases";
    }

    return "Execute Test Run";
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e4e7ec",
          borderRadius: "10px",
          overflow: "auto",
          backgroundColor: "#fff",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 1050,
            "& .MuiTableCell-root": {
              borderBottom:
                "1px solid #f0f2f5",
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#fcfcfd",
              }}
            >
              <TableCell
                sx={{
                  width: 95,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                Run
              </TableCell>

              <TableCell
                sx={{
                  width: 180,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Suite
              </TableCell>

              <TableCell
                sx={{
                  minWidth: 190,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Test Run
              </TableCell>

              <TableCell
                sx={{
                  width: 115,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Type
              </TableCell>

              <TableCell
                sx={{
                  width: 110,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Build
              </TableCell>

              <TableCell
                sx={{
                  width: 120,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Environment
              </TableCell>

              <TableCell
                sx={{
                  width: 110,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Tester
              </TableCell>

              <TableCell
                sx={{
                  width: 105,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Status
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  width: 125,
                  py: 0.9,
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {testRuns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  sx={{
                    borderBottom: "none",
                    py: 6,
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        mx: "auto",
                        mb: 1.2,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f2f4f7",
                        color: "#667085",
                      }}
                    >
                      <PlayArrowIcon
                        sx={{
                          fontSize: 20,
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 650,
                        color: "#344054",
                      }}
                    >
                      No test runs found
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: "0.66rem",
                        color: "#667085",
                      }}
                    >
                      Create a test run to
                      start tracking execution
                      results.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              testRuns.map((testRun) => {
                const executable =
                  canExecute(testRun);

                

                return (
                  <TableRow
                    key={testRun.id}
                    hover
                    sx={{
                      backgroundColor: "#fff",
                    }}
                  >
                    {/* Run */}
                    <TableCell
                      sx={{
                        py: 0.9,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          fontWeight: 750,
                          color: "#175cd3",
                        }}
                      >
                        {testRun.run_code}
                      </Typography>
                    </TableCell>

                    {/* Suite */}
                    <TableCell
                      sx={{
                        py: 0.9,
                        maxWidth: 180,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.67rem",
                          fontWeight: 650,
                          color: "#344054",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={`${testRun.suite.suite_code} - ${testRun.suite.name}`}
                      >
                        {testRun.suite.suite_code}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,
                          fontSize: "0.61rem",
                          color: "#667085",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={testRun.suite.name}
                      >
                        {testRun.suite.name}
                      </Typography>
                    </TableCell>

                    {/* Name */}
                    <TableCell
                      sx={{
                        py: 0.9,
                        maxWidth: 220,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.71rem",
                          fontWeight: 650,
                          color: "#101828",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={testRun.name}
                      >
                        {testRun.name}
                      </Typography>
                    </TableCell>

                    {/* Execution Type */}
                    <TableCell
                      sx={{
                        py: 0.9,
                      }}
                    >
                      <Chip
                        label={
                          testRun.execution_type
                        }
                        size="small"
                        sx={{
                          height: 22,
                          borderRadius: "6px",
                          fontSize: "0.6rem",
                          fontWeight: 650,
                          ...getExecutionTypeSx(
                            testRun.execution_type,
                          ),
                        }}
                      />
                    </TableCell>

                    {/* Build */}
                    <TableCell
                      sx={{
                        py: 0.9,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.66rem",
                          color: "#475467",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {testRun.build_version ??
                          "-"}
                      </Typography>
                    </TableCell>

                    {/* Environment */}
                    <TableCell
                      sx={{
                        py: 0.9,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.66rem",
                          color: "#475467",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 110,
                        }}
                        title={
                          testRun.environment ??
                          undefined
                        }
                      >
                        {testRun.environment ??
                          "-"}
                      </Typography>
                    </TableCell>

                    {/* Tester */}
                    <TableCell
                      sx={{
                        py: 0.9,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.66rem",
                          color: "#475467",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 100,
                        }}
                        title={
                          testRun.tester ??
                          undefined
                        }
                      >
                        {testRun.tester ?? "-"}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      sx={{
                        py: 0.9,
                      }}
                    >
                      <Chip
                        label={testRun.status}
                        color={getTestRunStatusColor(
                          testRun.status,
                        )}
                        size="small"
                        sx={{
                          height: 23,
                          borderRadius: "6px",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      align="right"
                      sx={{
                        py: 0.65,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onViewDetails(
                              testRun,
                            )
                          }
                          sx={{
                            width: 30,
                            height: 30,
                            mr: 0.25,
                            color: "#475467",
                            borderRadius: "7px",
                            "&:hover": {
                              backgroundColor:
                                "#f2f4f7",
                              color: "#175cd3",
                            },
                          }}
                        >
                          <VisibilityIcon
                            sx={{
                              fontSize: 16,
                            }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={getExecuteTooltip(
                          testRun,
                          executable,
                        )}
                      >
                        <span>
                          <IconButton
                            size="small"
                            disabled={
                              !executable
                            }
                            onClick={() =>
                              onExecute(
                                testRun,
                              )
                            }
                            sx={{
                              width: 30,
                              height: 30,
                              mr: 0.25,
                              color: executable
                                ? "#1570ef"
                                : "#98a2b3",
                              borderRadius: "7px",
                              "&:hover": {
                                backgroundColor:
                                  executable
                                    ? "#eff8ff"
                                    : "transparent",
                              },
                            }}
                          >
                            <PlayArrowIcon
                              sx={{
                                fontSize: 17,
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="More actions">
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            openMenu(
                              event,
                              testRun,
                            )
                          }
                          sx={{
                            width: 30,
                            height: 30,
                            color: "#475467",
                            borderRadius: "7px",
                            "&:hover": {
                              backgroundColor:
                                "#f2f4f7",
                            },
                          }}
                        >
                          <MoreVertIcon
                            sx={{
                              fontSize: 18,
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 190,
              borderRadius: "9px",
              border:
                "1px solid #e4e7ec",
              boxShadow:
                "0 8px 24px rgba(16,24,40,0.12)",
              "& .MuiMenuItem-root": {
                minHeight: 34,
                px: 1.25,
                fontSize: "0.72rem",
                borderRadius: "6px",
                mx: 0.4,
                my: 0.15,
              },
            },
          },
        }}
      >
        {menuTestRun &&
          menuTestRun.execution_type
            .trim()
            .toLowerCase() ===
            "automated" &&
          menuTestRun.automation_token && (
            <MenuItem
              onClick={() =>
                handleMenuAction(() =>
                  onCopyToken(
                    menuTestRun,
                  ),
                )
              }
            >
              <ContentCopyIcon
                sx={{
                  mr: 1,
                  fontSize: 16,
                  color: "#667085",
                }}
              />
              Copy Automation Command
            </MenuItem>
          )}

        {menuTestRun && (
          <MenuItem
            onClick={() =>
              handleMenuAction(() =>
                onEdit(menuTestRun),
              )
            }
          >
            <EditIcon
              sx={{
                mr: 1,
                fontSize: 16,
                color: "#667085",
              }}
            />
            Edit Test Run
          </MenuItem>
        )}

        {menuTestRun && (
          <MenuItem
            onClick={() =>
              handleMenuAction(() =>
                onDelete(menuTestRun),
              )
            }
            sx={{
              color: "#d92d20",
            }}
          >
            <DeleteIcon
              sx={{
                mr: 1,
                fontSize: 16,
                color: "#d92d20",
              }}
            />
            Delete Test Run
          </MenuItem>
        )}
      </Menu>
    </>
  );
}