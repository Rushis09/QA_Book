import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Checkbox,
  Chip,
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

import type { TestCase } from "../../types/testCase";

interface TestCaseTableProps {
  testCases: TestCase[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCase: TestCase) => void;
}

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "High":
      return {
        backgroundColor: "#fef3f2",
        color: "#b42318",
        borderColor: "#fecdca",
      };
    case "Medium":
      return {
        backgroundColor: "#fffaeb",
        color: "#b54708",
        borderColor: "#fedf89",
      };
    case "Low":
      return {
        backgroundColor: "#ecfdf3",
        color: "#027a48",
        borderColor: "#abefc6",
      };
    default:
      return {
        backgroundColor: "#f2f4f7",
        color: "#475467",
        borderColor: "#d0d5dd",
      };
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Approved":
      return {
        backgroundColor: "#eef4ff",
        color: "#3538cd",
        borderColor: "#c7d7fe",
      };
    case "Ready":
      return {
        backgroundColor: "#ecfdf3",
        color: "#027a48",
        borderColor: "#abefc6",
      };
    case "Draft":
      return {
        backgroundColor: "#f2f4f7",
        color: "#475467",
        borderColor: "#d0d5dd",
      };
    default:
      return {
        backgroundColor: "#f2f4f7",
        color: "#475467",
        borderColor: "#d0d5dd",
      };
  }
}

function getEligibilityStyles(eligibility: string) {
  if (eligibility === "Eligible") {
    return {
      backgroundColor: "#ecfdf3",
      color: "#027a48",
      borderColor: "#abefc6",
    };
  }

  return {
    backgroundColor: "#fef3f2",
    color: "#b42318",
    borderColor: "#fecdca",
  };
}

function getAutomationStyles(status: string) {
  if (status === "Automated") {
    return {
      backgroundColor: "#ecfdf3",
      color: "#027a48",
      borderColor: "#abefc6",
    };
  }

  return {
    backgroundColor: "#eef4ff",
    color: "#175cd3",
    borderColor: "#b2ddff",
  };
}

function StatusChip({
  label,
  styles,
}: {
  label: string;
  styles: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
}) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 22,
        borderRadius: "6px",
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: `1px solid ${styles.borderColor}`,
        fontSize: "0.63rem",
        fontWeight: 700,
        "& .MuiChip-label": {
          px: 0.7,
        },
      }}
    />
  );
}

const headCellSx = {
  py: 0.85,
  px: 0.85,
  fontSize: "0.62rem",
  fontWeight: 750,
  color: "#667085",
  textTransform: "uppercase" as const,
  letterSpacing: "0.025em",
  whiteSpace: "nowrap" as const,
};

const bodyCellSx = {
  py: 0.75,
  px: 0.85,
};

const singleLineTextSx = {
  fontSize: "0.68rem",
  color: "#344054",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default function TestCaseTable({
  testCases,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: TestCaseTableProps) {
  const visibleIds = testCases.map(
    (testCase) => testCase.id,
  );

  const selectedVisibleIds = visibleIds.filter(
    (id) => selectedIds.includes(id),
  );

  const allSelected =
    visibleIds.length > 0 &&
    selectedVisibleIds.length === visibleIds.length;

  const someSelected =
    selectedVisibleIds.length > 0 &&
    selectedVisibleIds.length < visibleIds.length;

  function handleSelectAll() {
    if (allSelected) {
      onSelectionChange(
        selectedIds.filter(
          (id) => !visibleIds.includes(id),
        ),
      );
      return;
    }

    const nextIds = [
      ...selectedIds,
      ...visibleIds.filter(
        (id) => !selectedIds.includes(id),
      ),
    ];

    onSelectionChange(nextIds);
  }

  function handleSelectTestCase(testCaseId: number) {
    if (selectedIds.includes(testCaseId)) {
      onSelectionChange(
        selectedIds.filter(
          (id) => id !== testCaseId,
        ),
      );
      return;
    }

    onSelectionChange([
      ...selectedIds,
      testCaseId,
    ]);
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e4e7ec",
        borderRadius: "10px",
        overflow: "auto",
        backgroundColor: "#fff",
        maxHeight: "calc(100vh - 260px)",
        minHeight: 280,
      }}
    >
      <Table
        size="small"
        sx={{
          width: "100%",
          tableLayout: "fixed",
          "& .MuiTableCell-root": {
            borderBottom: "1px solid #eef0f3",
          },
        }}
      >
        <TableHead
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            backgroundColor: "#f9fafb",
          }}
        >
          <TableRow
            sx={{
              backgroundColor: "#f9fafb",
            }}
          >
            <TableCell
              padding="checkbox"
              sx={{
                width: 38,
                py: 0.75,
                px: 0.5,
              }}
            >
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
              />
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "7%" }}>
              Test Case
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "11%" }}>
              Scenario
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "10%" }}>
              Requirement
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "6%" }}>
              Module
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "6%" }}>
              Priority
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "6%" }}>
              Status
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "8%" }}>
              Eligibility
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "8%" }}>
              Automation
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "11%" }}>
              Title
            </TableCell>

            <TableCell sx={{ ...headCellSx, width: "14%" }}>
              Expected Result
            </TableCell>

            <TableCell
              align="right"
              sx={{
                ...headCellSx,
                width: "7%",
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={12}
                align="center"
                sx={{
                  py: 5,
                  borderBottom: "none",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    color: "#344054",
                  }}
                >
                  No test cases found
                </Typography>

                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: "0.68rem",
                    color: "#98a2b3",
                  }}
                >
                  Try changing your filters or create a
                  new test case.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            testCases.map((testCase) => {
              const isSelected =
                selectedIds.includes(testCase.id);

              return (
                <TableRow
                  key={testCase.id}
                  selected={isSelected}
                  hover
                  sx={{
                    "&:last-child .MuiTableCell-root": {
                      borderBottom: "none",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#f5f8ff",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#f5f8ff",
                    },
                  }}
                >
                  <TableCell
                    padding="checkbox"
                    sx={{
                      py: 0.65,
                      px: 0.5,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() =>
                        handleSelectTestCase(
                          testCase.id,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 750,
                        color: "#175cd3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {testCase.test_case_code}
                    </Typography>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Typography
                      sx={{
                        ...singleLineTextSx,
                        fontWeight: 650,
                      }}
                      title={`${testCase.scenario.scenario_code} - ${testCase.scenario.title}`}
                    >
                      {testCase.scenario.scenario_code}
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
                      title={testCase.scenario.title}
                    >
                      {testCase.scenario.title}
                    </Typography>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Typography
                      sx={{
                        ...singleLineTextSx,
                        fontWeight: 650,
                      }}
                      title={`${testCase.scenario.requirement.requirement_code} - ${testCase.scenario.requirement.module}`}
                    >
                      {testCase.scenario.requirement.requirement_code}
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
                      title={
                        testCase.scenario.requirement.module
                      }
                    >
                      {testCase.scenario.requirement.module}
                    </Typography>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Typography sx={singleLineTextSx}>
                      {testCase.module}
                    </Typography>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <StatusChip
                      label={testCase.priority}
                      styles={getPriorityStyles(
                        testCase.priority,
                      )}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <StatusChip
                      label={testCase.status}
                      styles={getStatusStyles(
                        testCase.status,
                      )}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <StatusChip
                      label={
                        testCase.automation_eligibility
                      }
                      styles={getEligibilityStyles(
                        testCase.automation_eligibility,
                      )}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <StatusChip
                      label={
                        testCase.automation_status
                      }
                      styles={getAutomationStyles(
                        testCase.automation_status,
                      )}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Typography
                      sx={singleLineTextSx}
                      title={testCase.title}
                    >
                      {testCase.title}
                    </Typography>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: "#667085",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={
                        testCase.expected_result ??
                        "-"
                      }
                    >
                      {testCase.expected_result ?? "-"}
                    </Typography>
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.15,
                      }}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onEdit(testCase)
                          }
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "7px",
                            color: "#475467",
                            "&:hover": {
                              backgroundColor: "#f2f4f7",
                              color: "#175cd3",
                            },
                          }}
                        >
                          <EditIcon
                            sx={{ fontSize: 16 }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onDelete(testCase)
                          }
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "7px",
                            color: "#98a2b3",
                            "&:hover": {
                              backgroundColor: "#fef3f2",
                              color: "#d92d20",
                            },
                          }}
                        >
                          <DeleteIcon
                            sx={{ fontSize: 16 }}
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}