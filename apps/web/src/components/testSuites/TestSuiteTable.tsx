import { useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

import type { TestSuite } from "../../types/testSuite";

interface TestSuiteTableProps {
  testSuites: TestSuite[];
  onEdit: (testSuite: TestSuite) => void;
  onDelete: (testSuite: TestSuite) => void;
  onAssign: (testSuite: TestSuite) => void;
}

export default function TestSuiteTable({
  testSuites,
  onEdit,
  onDelete,
  onAssign,
}: TestSuiteTableProps) {
  const [menuAnchor, setMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [menuSuite, setMenuSuite] =
    useState<TestSuite | null>(null);

  function getStatusStyles(status: string) {
    if (status === "Active") {
      return {
        backgroundColor: "#ecfdf3",
        color: "#027a48",
        borderColor: "#abefc6",
      };
    }

    return {
      backgroundColor: "#f2f4f7",
      color: "#475467",
      borderColor: "#d0d5dd",
    };
  }

  function handleOpenMenu(
    event: React.MouseEvent<HTMLElement>,
    testSuite: TestSuite,
  ) {
    setMenuAnchor(event.currentTarget);
    setMenuSuite(testSuite);
  }

  function handleCloseMenu() {
    setMenuAnchor(null);
    setMenuSuite(null);
  }

  function handleManageTestCases() {
    if (!menuSuite) {
      return;
    }

    const suite = menuSuite;

    handleCloseMenu();
    onAssign(suite);
  }

  function handleEditSuite() {
    if (!menuSuite) {
      return;
    }

    const suite = menuSuite;

    handleCloseMenu();
    onEdit(suite);
  }

  function handleDeleteSuite() {
    if (!menuSuite) {
      return;
    }

    const suite = menuSuite;

    handleCloseMenu();
    onDelete(suite);
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
          maxHeight: "calc(100vh - 330px)",
          minHeight: 260,
        }}
      >
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            minWidth: 850,
          }}
        >
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "#fcfcfd",
            }}
          >
            <TableRow
              sx={{
                backgroundColor: "#fcfcfd",
              }}
            >
              <TableCell
                sx={{
                  width: 105,
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Suite
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: 210,
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Project
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: 245,
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Suite Name
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: 125,
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Coverage
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: 110,
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Status
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Description
                </Typography>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  width: 145,
                  py: 1,
                  px: 1.25,
                  borderBottom:
                    "1px solid #eaecf0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.035em",
                  }}
                >
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {testSuites.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{
                    py: 5,
                    borderBottom: "none",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#344054",
                    }}
                  >
                    No test suites found.
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: "0.7rem",
                      color: "#667085",
                    }}
                  >
                    Try changing your search or
                    filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              testSuites.map((testSuite) => {
                const statusStyles =
                  getStatusStyles(
                    testSuite.status,
                  );

                const testCaseCount =
                  testSuite.test_cases.length;

                return (
                  <TableRow
                    key={testSuite.id}
                    hover
                    sx={{
                      "&:last-child td": {
                        borderBottom: "none",
                      },
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#101828",
                        }}
                      >
                        {testSuite.suite_code}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontSize: "0.74rem",
                            fontWeight: 600,
                            color: "#344054",
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            testSuite.project
                              .project_code
                          }
                        </Typography>

                        <Typography
                          noWrap
                          sx={{
                            mt: 0.15,
                            fontSize: "0.66rem",
                            color: "#667085",
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            testSuite.project
                              .name
                          }
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.74rem",
                          fontWeight: 600,
                          color: "#101828",
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {testSuite.name}
                      </Typography>

                      <Typography
                        noWrap
                        sx={{
                          mt: 0.15,
                          fontSize: "0.64rem",
                          color: "#98a2b3",
                        }}
                      >
                        {testSuite.suite_code}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.65,
                        }}
                      >
                        <PlaylistAddCheckIcon
                          sx={{
                            fontSize: 16,
                            color: "#1570ef",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#344054",
                          }}
                        >
                          {testCaseCount}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.65rem",
                            color: "#667085",
                          }}
                        >
                          {testCaseCount === 1
                            ? "test case"
                            : "test cases"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                      }}
                    >
                      <Chip
                        label={testSuite.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 25,
                          borderRadius: "7px",
                          fontSize: "0.65rem",
                          fontWeight: 650,
                          backgroundColor:
                            statusStyles.backgroundColor,
                          color:
                            statusStyles.color,
                          borderColor:
                            statusStyles.borderColor,
                          "& .MuiChip-label": {
                            px: 0.9,
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.69rem",
                          color: "#667085",
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {testSuite.description ||
                          "No description provided."}
                      </Typography>
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        py: 1.1,
                        px: 1.25,
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip title="Manage Test Cases">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onAssign(testSuite)
                          }
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 0.25,
                            color: "#9e2bbf",
                            "&:hover": {
                              backgroundColor:
                                "#f9edff",
                            },
                          }}
                        >
                          <PlaylistAddCheckIcon
                            sx={{
                              fontSize: 18,
                            }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="More actions">
                        <IconButton
                          size="small"
                          aria-label={`More actions for ${testSuite.suite_code}`}
                          aria-controls={
                            menuSuite?.id ===
                            testSuite.id
                              ? "test-suite-actions-menu"
                              : undefined
                          }
                          aria-haspopup="true"
                          aria-expanded={
                            menuSuite?.id ===
                            testSuite.id
                              ? "true"
                              : undefined
                          }
                          onClick={(event) =>
                            handleOpenMenu(
                              event,
                              testSuite,
                            )
                          }
                          sx={{
                            width: 32,
                            height: 32,
                            color: "#667085",
                            "&:hover": {
                              backgroundColor:
                                "#f2f4f7",
                            },
                          }}
                        >
                          <MoreVertIcon
                            sx={{
                              fontSize: 19,
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
        id="test-suite-actions-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 0.5,
              minWidth: 190,
              borderRadius: "9px",
              border:
                "1px solid #eaecf0",
              boxShadow:
                "0 8px 24px rgba(16, 24, 40, 0.12)",
              "& .MuiMenuItem-root": {
                minHeight: 36,
                px: 1.25,
                gap: 1,
                fontSize: "0.74rem",
                color: "#344054",
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={handleManageTestCases}
        >
          <PlaylistAddCheckIcon
            sx={{
              fontSize: 17,
              color: "#9e2bbf",
            }}
          />
          Manage Test Cases
        </MenuItem>

        <MenuItem
          onClick={handleEditSuite}
        >
          <EditIcon
            sx={{
              fontSize: 17,
              color: "#1570ef",
            }}
          />
          Edit Suite
        </MenuItem>

        <MenuItem
          onClick={handleDeleteSuite}
          sx={{
            "&:hover": {
              backgroundColor: "#fef3f2",
            },
          }}
        >
          <DeleteIcon
            sx={{
              fontSize: 17,
              color: "#d92d20",
            }}
          />
          <Typography
            component="span"
            sx={{
              fontSize: "0.74rem",
              color: "#d92d20",
            }}
          >
            Delete Suite
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}