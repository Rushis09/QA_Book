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

import type { TestCase } from "../../types/testCase";

interface TestCaseTableProps {
  testCases: TestCase[];
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCase: TestCase) => void;
}

export default function TestCaseTable({
  testCases,
  onEdit,
  onDelete,
}: TestCaseTableProps) {
  function getPriorityColor(
    priority: string,
  ):
    | "error"
    | "warning"
    | "success"
    | "default" {
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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Test Case Code</TableCell>
            <TableCell>Scenario</TableCell>
            <TableCell>Component</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Expected Result</TableCell>
            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
              >
                No test cases found.
              </TableCell>
            </TableRow>
          ) : (
            testCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>
                  {testCase.test_case_code}
                </TableCell>

                <TableCell>
                  {`${testCase.scenario.scenario_code} - ${testCase.scenario.title}`}
                </TableCell>

                <TableCell>
                  {testCase.component}
                </TableCell>

                <TableCell>
                  <Chip
                    label={testCase.priority}
                    color={getPriorityColor(
                      testCase.priority,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {testCase.title}
                </TableCell>

                <TableCell>
                  {testCase.expected_result ??
                    "-"}
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(testCase)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(testCase)
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