import {
  Box,
  Checkbox,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { TestCase } from "../../../types/testCase";

interface AssignedTestCasesTableProps {
  testCases: TestCase[];
  selectedIds: number[];
  aiRecommendedIds: number[];
}

export default function AssignedTestCasesTable({
  testCases,
  selectedIds,
  aiRecommendedIds,
}: AssignedTestCasesTableProps) {
  const assignedTestCases = testCases.filter(
    (testCase) =>
      selectedIds.includes(testCase.id),
  );

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
        border:
          "1px solid #e4e7ec",
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
              Assigned Test Cases
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.66rem",
                color: "#667085",
              }}
            >
              Test cases currently included
              in this suite.
            </Typography>
          </Box>

          <Chip
            label={`${assignedTestCases.length} ${
              assignedTestCases.length === 1
                ? "assigned"
                : "assigned"
            }`}
            size="small"
            sx={{
              height: 24,
              borderRadius: "6px",
              backgroundColor: "#eff8ff",
              color: "#175cd3",
              border:
                "1px solid #b2ddff",
              fontSize: "0.65rem",
              fontWeight: 650,
              flexShrink: 0,
            }}
          />
        </Box>
      </Box>

      {/* Assignment Summary */}
      {assignedTestCases.length > 0 && (
        <Box
          sx={{
            px: 1.25,
            py: 0.55,
            backgroundColor:
              "#f9fafb",
            borderBottom:
              "1px solid #eaecf0",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.64rem",
              color: "#667085",
            }}
          >
            These test cases will be
            included when the suite is
            saved.
          </Typography>
        </Box>
      )}

      <Table
        size="small"
        sx={{
          minWidth: 380,
          "& .MuiTableCell-root": {
            borderBottom:
              "1px solid #f0f2f5",
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
              sx={{
                width: 44,
                py: 0.85,
                px: 1,
                fontSize: "0.62rem",
                fontWeight: 750,
                color: "#667085",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.04em",
              }}
            >
              #
            </TableCell>

            <TableCell
              sx={{
                width: 80,
                py: 0.85,
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
                width: 82,
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
              Priority
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {assignedTestCases.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                sx={{
                  borderBottom:
                    "none",
                  py: 5,
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
                      width: 36,
                      height: 36,
                      mx: "auto",
                      mb: 1,
                      borderRadius: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      backgroundColor:
                        "#f2f4f7",
                    }}
                  >
                    <Checkbox
                      disabled
                      size="small"
                      sx={{
                        p: 0,
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "0.76rem",
                      fontWeight: 650,
                      color: "#344054",
                    }}
                  >
                    No test cases assigned
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontSize: "0.65rem",
                      color: "#667085",
                      lineHeight: 1.4,
                    }}
                  >
                    Select test cases from
                    the available list to
                    build this suite.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            assignedTestCases.map(
              (testCase, index) => {
                const aiRecommended =
                  aiRecommendedIds.includes(
                    testCase.id,
                  );

                return (
                  <TableRow
                    key={testCase.id}
                    hover
                    sx={{
                      backgroundColor:
                        "#fff",
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 0.8,
                        px: 1,
                        color: "#98a2b3",
                        fontSize: "0.64rem",
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
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
                          fontSize:
                            "0.67rem",
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
                        maxWidth: 220,
                      }}
                    >
                      <Stack
                        spacing={0.4}
                      >
                        <Typography
                          sx={{
                            fontSize:
                              "0.71rem",
                            fontWeight: 600,
                            color:
                              "#101828",
                            lineHeight:
                              1.3,
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
                          {
                            testCase.title
                          }
                        </Typography>

                        {aiRecommended && (
                          <Chip
                            label="AI Recommended"
                            size="small"
                            sx={{
                              alignSelf:
                                "flex-start",
                              height: 20,
                              borderRadius:
                                "5px",
                              backgroundColor:
                                "#faf8ff",
                              color:
                                "#6941c6",
                              border:
                                "1px solid #e9d7fe",
                              fontSize:
                                "0.58rem",
                              fontWeight: 650,
                            }}
                          />
                        )}
                      </Stack>
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
                          borderRadius:
                            "6px",
                          fontSize:
                            "0.6rem",
                          fontWeight: 650,
                          ...getPrioritySx(
                            testCase.priority,
                          ),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              },
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}