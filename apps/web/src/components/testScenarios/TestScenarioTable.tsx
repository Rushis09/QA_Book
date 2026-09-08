import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
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

import type { TestScenario } from "../../types/testScenario";

interface TestScenarioTableProps {
  testScenarios: TestScenario[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (testScenario: TestScenario) => void;
  onDelete: (testScenario: TestScenario) => void;
}

function getPriorityColor(
  priority: string,
): "error" | "warning" | "success" | "default" {
  switch (priority) {
    case "High":
      return "error";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
    default:
      return "default";
  }
}

function getStatusColor(
  status: string,
): "default" | "primary" | "success" {
  switch (status) {
    case "Approved":
      return "primary";
    case "Ready":
      return "success";
    case "Implemented":
      return "success";
    default:
      return "default";
  }
}

export default function TestScenarioTable({
  testScenarios,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: TestScenarioTableProps) {
  const allSelected =
    testScenarios.length > 0 &&
    selectedIds.length === testScenarios.length;

  function toggleSelectAll(checked: boolean) {
    onSelectionChange(
      checked
        ? testScenarios.map((scenario) => scenario.id)
        : [],
    );
  }

  function toggleSelection(id: number) {
    if (selectedIds.includes(id)) {
      onSelectionChange(
        selectedIds.filter(
          (selectedId) => selectedId !== id,
        ),
      );
      return;
    }

    onSelectionChange([...selectedIds, id]);
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Table
        size="small"
        sx={{
          "& .MuiTableCell-root": {
            borderColor: "#edf1f7",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            backgroundColor: "#f8fafc",
            color: "#64748b",
            fontSize: "0.68rem",
            fontWeight: 750,
            letterSpacing: "0.045em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            py: 1.15,
          },
          "& .MuiTableBody-root .MuiTableRow-root": {
            transition: "background-color 0.15s ease",
          },
          "& .MuiTableBody-root .MuiTableRow-root:hover": {
            backgroundColor: "#f8fbff",
          },
          "& .MuiTableBody-root .MuiTableCell-root": {
            py: 1.15,
            fontSize: "0.78rem",
            color: "#334155",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={
                  selectedIds.length > 0 &&
                  !allSelected
                }
                onChange={(event) =>
                  toggleSelectAll(
                    event.target.checked,
                  )
                }
              />
            </TableCell>

            <TableCell>Scenario</TableCell>
            <TableCell>Requirement</TableCell>
            <TableCell>Module</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Description</TableCell>

            <TableCell
              align="right"
              sx={{ width: 100 }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testScenarios.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                align="center"
                sx={{
                  py: 5,
                  color: "#94a3b8",
                }}
              >
                No test scenarios found.
              </TableCell>
            </TableRow>
          ) : (
            testScenarios.map((testScenario) => (
              <TableRow
                key={testScenario.id}
                hover
                selected={selectedIds.includes(
                  testScenario.id,
                )}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={selectedIds.includes(
                      testScenario.id,
                    )}
                    onChange={() =>
                      toggleSelection(
                        testScenario.id,
                      )
                    }
                  />
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 750,
                      color: "#1e293b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {testScenario.scenario_code}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.76rem",
                      fontWeight: 650,
                      color: "#334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {testScenario.requirement
                      .requirement_code}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.76rem",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {testScenario.module}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    maxWidth: 260,
                  }}
                >
                  <Tooltip
                    title={testScenario.title}
                    placement="top"
                  >
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 650,
                        color: "#1e293b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 260,
                      }}
                    >
                      {testScenario.title}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Chip
                    label={testScenario.priority}
                    color={getPriorityColor(
                      testScenario.priority,
                    )}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={testScenario.status}
                    color={getStatusColor(
                      testScenario.status,
                    )}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    maxWidth: 300,
                  }}
                >
                  <Tooltip
                    title={
                      testScenario.description ||
                      "No description"
                    }
                    placement="top"
                  >
                    <Typography
                      sx={{
                        fontSize: "0.74rem",
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 300,
                      }}
                    >
                      {testScenario.description || "-"}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        onEdit(testScenario)
                      }
                      sx={{
                        mr: 0.35,
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        onDelete(testScenario)
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}