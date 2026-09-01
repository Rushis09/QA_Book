import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { getTestRunStatusColor } from "../../utils/testRunStatus";

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

import type { TestRun } from "../../types/testRun";

interface TestRunTableProps {
  testRuns: TestRun[];
  onEdit: (testRun: TestRun) => void;
  onDelete: (testRun: TestRun) => void;
  onExecute: (testRun: TestRun) => void;
  onViewDetails: (testRun: TestRun) => void;
  canExecute: (testRun: TestRun) => boolean;
}

export default function TestRunTable({
  testRuns,
  onEdit,
  onDelete,
  onExecute,
  onViewDetails,
  canExecute,
}: TestRunTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Run Code</TableCell>
            <TableCell>Suite</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Execution Type</TableCell>
            <TableCell>Build</TableCell>
            <TableCell>Environment</TableCell>
            <TableCell>Tester</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testRuns.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                align="center"
              >
                No test runs found.
              </TableCell>
            </TableRow>
          ) : (
            testRuns.map((testRun) => {
              const executable =
                canExecute(testRun);

              return (
                <TableRow
                  key={testRun.id}
                >
                  <TableCell>
                    {testRun.run_code}
                  </TableCell>

                  <TableCell>
                    {`${testRun.suite.suite_code} - ${testRun.suite.name}`}
                  </TableCell>

                  <TableCell>
                    {testRun.name}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        testRun.execution_type
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {testRun.build_version ??
                      "-"}
                  </TableCell>

                  <TableCell>
                    {testRun.environment ??
                      "-"}
                  </TableCell>

                  <TableCell>
                    {testRun.tester ?? "-"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={testRun.status}
                      color={getTestRunStatusColor(
                        testRun.status,
                      )}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          onViewDetails(
                            testRun,
                          )
                        }
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={
                        executable
                          ? "Execute Test Run"
                          : "Cannot execute: Test Suite has no test cases"
                      }
                    >
                      <span>
                        <IconButton
                          color="secondary"
                          disabled={!executable}
                          onClick={() =>
                            onExecute(
                              testRun,
                            )
                          }
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Edit Test Run">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          onEdit(testRun)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Test Run">
                      <IconButton
                        color="error"
                        onClick={() =>
                          onDelete(testRun)
                        }
                      >
                        <DeleteIcon />
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
  );
}