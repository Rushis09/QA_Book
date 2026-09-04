import BugReportIcon from "@mui/icons-material/BugReport";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
  Tooltip,
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

export default function TestExecutionTable({
  executions,
  onViewRun,
  onCreateBug,
}: TestExecutionTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Execution ID
            </TableCell>

            <TableCell>
              Test Case
            </TableCell>

            <TableCell>
              Run
            </TableCell>

            <TableCell>
              Execution Type
            </TableCell>

            <TableCell>
              Status
            </TableCell>

            <TableCell>
              Actual Result
            </TableCell>

            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {executions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
              >
                No test executions found.
              </TableCell>
            </TableRow>
          ) : (
            executions.map((execution) => (
              <TableRow
                key={execution.id}
              >
                <TableCell>
                  {execution.id}
                </TableCell>

                <TableCell>
                  {execution.test_case.test_case_code}
                  {" - "}
                  {execution.test_case.title}
                </TableCell>

                <TableCell>
                  {execution.test_run.run_code}
                  {" - "}
                  {execution.test_run.name}
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      execution.execution_type
                    }
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={execution.status}
                    color={getStatusColor(
                      execution.status,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {execution.actual_result ??
                    "-"}
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Open Test Run">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        onViewRun(
                          execution,
                        )
                      }
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>

                  {execution.status ===
                    "Failed" && (
                    <Tooltip title="Create Bug">
                      <IconButton
                        color="error"
                        onClick={() =>
                          onCreateBug(
                            execution,
                          )
                        }
                      >
                        <BugReportIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}