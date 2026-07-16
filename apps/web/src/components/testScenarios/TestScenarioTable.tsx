import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import type { TestScenario } from "../../types/testScenario";

interface TestScenarioTableProps {
  testScenarios: TestScenario[];
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
    case "Implemented":
      return "success";
    default:
      return "default";
  }
}

export default function TestScenarioTable({
  testScenarios,
  onEdit,
  onDelete,
}: TestScenarioTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Scenario Code</TableCell>
            <TableCell>Requirement</TableCell>
            <TableCell>Module</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testScenarios.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                align="center"
              >
                No test scenarios found.
              </TableCell>
            </TableRow>
          ) : (
            testScenarios.map((testScenario) => (
              <TableRow key={testScenario.id}>
                <TableCell>
                  {testScenario.scenario_code}
                </TableCell>

                <TableCell>
                  {testScenario.requirement.requirement_code}
                </TableCell>

                <TableCell>
                  {testScenario.module}
                </TableCell>

                <TableCell>
                  {testScenario.title}
                </TableCell>

                <TableCell>
                  <Chip
                    label={testScenario.priority}
                    color={getPriorityColor(
                      testScenario.priority,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={testScenario.status}
                    color={getStatusColor(
                      testScenario.status,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {testScenario.description ?? "-"}
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(testScenario)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(testScenario)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}