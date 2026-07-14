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
  onViewDetails: (
  testRun: TestRun,
) => void;
}

export default function TestRunTable({
  testRuns,
  onEdit,
  onDelete,
  onExecute,
  onViewDetails,
}: TestRunTableProps) {
  

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Run Code</TableCell>
            <TableCell>Suite</TableCell>
            <TableCell>Name</TableCell>
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
                colSpan={8}
                align="center"
              >
                No test runs found.
              </TableCell>
            </TableRow>
          ) : (
            testRuns.map((testRun) => (
              <TableRow key={testRun.id}>
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

                <Tooltip title="View Details">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onViewDetails(testRun)                
    }
  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>


                <TableCell align="right">
                  <Tooltip title="Execute Test Run">
                    <IconButton
                      color="secondary"
                      onClick={() =>
                        onExecute(testRun)
                      }
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(testRun)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(testRun)
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