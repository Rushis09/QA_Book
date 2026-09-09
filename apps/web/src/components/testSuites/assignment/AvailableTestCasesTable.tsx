import {
  Box,
  Checkbox,
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

import type { TestCase } from "../../../types/testCase";

interface AvailableTestCasesTableProps {
  testCases: TestCase[];
  selectedIds: number[];
  aiRecommendedIds: number[];
  onToggle: (id: number) => void;
}

export default function AvailableTestCasesTable({
  testCases,
  selectedIds,
  aiRecommendedIds,
  onToggle,
}: AvailableTestCasesTableProps) {
  const visibleIds = testCases.map(
    (testCase) => testCase.id,
  );

  const selectedVisibleIds =
    visibleIds.filter((id) =>
      selectedIds.includes(id),
    );

  const allSelected =
    visibleIds.length > 0 &&
    selectedVisibleIds.length ===
      visibleIds.length;

  const someSelected =
    selectedVisibleIds.length > 0 &&
    !allSelected;

  function toggleSelectAll(
    checked: boolean,
  ) {
    if (checked) {
      testCases.forEach((testCase) => {
        if (
          !selectedIds.includes(
            testCase.id,
          )
        ) {
          onToggle(testCase.id);
        }
      });
    } else {
      visibleIds.forEach((id) => {
        if (selectedIds.includes(id)) {
          onToggle(id);
        }
      });
    }
  }

  function getPrioritySx(
    priority: string,
  ) {
    const normalized =
      priority.toLowerCase();

    if (normalized === "high") {
      return {
        backgroundColor: "#fff1f3",
        color: "#c01048",
        border: "1px solid #fecdd6",
      };
    }

    if (normalized === "medium") {
      return {
        backgroundColor: "#fffaeb",
        color: "#b54708",
        border: "1px solid #fedf89",
      };
    }

    if (normalized === "low") {
      return {
        backgroundColor: "#ecfdf3",
        color: "#027a48",
        border: "1px solid #abefc6",
      };
    }

    return {
      backgroundColor: "#f2f4f7",
      color: "#475467",
      border: "1px solid #e4e7ec",
    };
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e4e7ec",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          borderBottom:
            "1px solid #eaecf0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.84rem",
                fontWeight: 750,
                color: "#101828",
                lineHeight: 1.2,
              }}
            >
              Available Test Cases
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.66rem",
                color: "#667085",
              }}
            >
              Select test cases to
              include in this suite.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
            }}
          >
            <Chip
              label={`${testCases.length} ${
                testCases.length === 1
                  ? "result"
                  : "results"
              }`}
              size="small"
              sx={{
                height: 24,
                borderRadius: "6px",
                backgroundColor:
                  "#f2f4f7",
                color: "#475467",
                fontSize: "0.65rem",
                fontWeight: 650,
              }}
            />

            {selectedVisibleIds.length >
              0 && (
              <Chip
                label={`${selectedVisibleIds.length} selected`}
                size="small"
                sx={{
                  height: 24,
                  borderRadius: "6px",
                  backgroundColor:
                    "#eff8ff",
                  color: "#175cd3",
                  border:
                    "1px solid #b2ddff",
                  fontSize: "0.65rem",
                  fontWeight: 650,
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Select All Bar */}
      {testCases.length > 0 && (
        <Box
          sx={{
            px: 1.25,
            py: 0.45,
            backgroundColor:
              "#f9fafb",
            borderBottom:
              "1px solid #eaecf0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(event) =>
              toggleSelectAll(
                event.target.checked,
              )
            }
            sx={{
              p: 0.65,
              mr: 0.5,
            }}
          />

          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 650,
              color: "#344054",
            }}
          >
            Select all visible
          </Typography>

          {someSelected && (
            <Typography
              sx={{
                ml: 0.75,
                fontSize: "0.64rem",
                color: "#667085",
              }}
            >
              ({selectedVisibleIds.length}{" "}
              selected)
            </Typography>
          )}
        </Box>
      )}

      {/* Table */}
      <Box
        sx={{
          maxHeight: "calc(100vh - 510px)",
          minHeight: 260,
          overflow: "auto",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: 560,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid #f0f2f5",
            },
          }}
        >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor:
                "#fcfcfd",
            }}
          >
            <TableCell
              padding="checkbox"
              sx={{
                width: 46,
                py: 0.85,
              }}
            />

            <TableCell
              sx={{
                py: 0.85,
                width: 90,
                fontSize: "0.62rem",
                fontWeight: 750,
                color: "#667085",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              Code
            </TableCell>

            <TableCell
              sx={{
                py: 0.85,
                fontSize: "0.62rem",
                fontWeight: 750,
                color: "#667085",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.04em",
              }}
            >
              Test Case
            </TableCell>

            <TableCell
              sx={{
                py: 0.85,
                width: 130,
                fontSize: "0.62rem",
                fontWeight: 750,
                color: "#667085",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.04em",
              }}
            >
              Scenario
            </TableCell>

            <TableCell
              sx={{
                py: 0.85,
                width: 105,
                fontSize: "0.62rem",
                fontWeight: 750,
                color: "#667085",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.04em",
              }}
            >
              Module
            </TableCell>

            <TableCell
              sx={{
                py: 0.85,
                width: 90,
                fontSize: "0.62rem",
                fontWeight: 750,
                color: "#667085",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.04em",
              }}
            >
              Priority
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.map((testCase) => {
            const selected =
              selectedIds.includes(
                testCase.id,
              );

            const aiRecommended =
              aiRecommendedIds.includes(
                testCase.id,
              );

            return (
              <TableRow
                key={testCase.id}
                hover
                selected={selected}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": {
                    backgroundColor:
                      "#f8fbff",
                  },
                  "&.Mui-selected:hover":
                    {
                      backgroundColor:
                        "#f5f9ff",
                    },
                }}
                onClick={() =>
                  onToggle(
                    testCase.id,
                  )
                }
              >
                <TableCell
                  padding="checkbox"
                  sx={{
                    py: 0.8,
                  }}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <Checkbox
                    size="small"
                    checked={selected}
                    onChange={() =>
                      onToggle(
                        testCase.id,
                      )
                    }
                  />
                </TableCell>

                <TableCell
                  sx={{
                    py: 0.8,
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#175cd3",
                    }}
                  >
                    {
                      testCase.test_case_code
                    }
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    py: 0.8,
                    maxWidth: 250,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#101828",
                      lineHeight: 1.3,
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                    title={
                      testCase.title
                    }
                  >
                    {testCase.title}
                  </Typography>

                  {aiRecommended && (
                    <Chip
                      label="AI Recommended"
                      size="small"
                      icon={
                        <Box
                          component="span"
                          sx={{
                            fontSize:
                              "0.65rem",
                            lineHeight: 1,
                          }}
                        >
                          ✦
                        </Box>
                      }
                      sx={{
                        mt: 0.45,
                        height: 20,
                        borderRadius: "5px",
                        backgroundColor:
                          "#faf8ff",
                        color: "#6941c6",
                        border:
                          "1px solid #e9d7fe",
                        fontSize: "0.58rem",
                        fontWeight: 650,
                        "& .MuiChip-icon":
                          {
                            color:
                              "#7f56d9",
                            ml: 0.45,
                            mr: -0.25,
                          },
                      }}
                    />
                  )}
                </TableCell>

                <TableCell
                  sx={{
                    py: 0.8,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.66rem",
                      color: "#475467",
                      whiteSpace:
                        "nowrap",
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      maxWidth: 120,
                    }}
                    title={
                      testCase.scenario
                        ?.scenario_code
                    }
                  >
                    {
                      testCase.scenario
                        ?.scenario_code
                    }
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    py: 0.8,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.66rem",
                      color: "#475467",
                      whiteSpace:
                        "nowrap",
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      maxWidth: 95,
                    }}
                    title={
                      testCase.module
                    }
                  >
                    {testCase.module}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    py: 0.8,
                  }}
                >
                  <Chip
                    label={
                      testCase.priority
                    }
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: "6px",
                      fontSize: "0.6rem",
                      fontWeight: 650,
                      ...getPrioritySx(
                        testCase.priority,
                      ),
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}

          {testCases.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                sx={{
                  borderBottom: "none",
                  py: 5,
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 650,
                      color: "#344054",
                    }}
                  >
                    No test cases found
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontSize: "0.66rem",
                      color: "#667085",
                    }}
                  >
                    Try adjusting the
                    filters or search
                    criteria.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </Box>
    </TableContainer>
  );
}