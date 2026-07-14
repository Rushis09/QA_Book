import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

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
  function getStatusColor(
    status: string,
  ): "success" | "default" {
    return status === "Active"
      ? "success"
      : "default";
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Suite Code</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testSuites.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
              >
                No test suites found.
              </TableCell>
            </TableRow>
          ) : (
            testSuites.map((testSuite) => (
              <TableRow key={testSuite.id}>
                <TableCell>
                  {testSuite.suite_code}
                </TableCell>

                <TableCell>
                  {`${testSuite.project.project_code} - ${testSuite.project.name}`}
                </TableCell>

                <TableCell>
                  {testSuite.name}
                </TableCell>

                <TableCell>
                  <Chip
                    label={testSuite.status}
                    color={getStatusColor(
                      testSuite.status,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {testSuite.description ??
                    "-"}
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Assign Test Cases">
                    <IconButton
                      color="secondary"
                      onClick={() =>
                        onAssign(testSuite)
                      }
                    >
                      <PlaylistAddCheckIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(testSuite)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(testSuite)
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