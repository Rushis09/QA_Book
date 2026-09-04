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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplayIcon from "@mui/icons-material/Replay";

import type { Bug } from "../../types/bug";

interface BugTableProps {
  bugs: Bug[];
  selectedBugIds: number[];
  onSelectionChange: (
    bugIds: number[],
  ) => void;
  onEdit: (bug: Bug) => void;
  onDelete: (bug: Bug) => void;
  onRetest: (bug: Bug) => void;
}

function getSeverityColor(
  severity: string,
):
  | "error"
  | "warning"
  | "info"
  | "success"
  | "default" {
  switch (severity) {
    case "Critical":
      return "error";

    case "High":
      return "warning";

    case "Medium":
      return "info";

    case "Low":
      return "success";

    default:
      return "default";
  }
}

function getStatusColor(
  status: string,
):
  | "error"
  | "warning"
  | "success"
  | "info"
  | "default" {
  switch (status) {
    case "Open":
      return "error";

    case "In Progress":
      return "warning";

    case "Fixed":
      return "info";

    case "Closed":
      return "success";

    default:
      return "default";
  }
}

export default function BugTable({
  bugs,
  selectedBugIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onRetest,
}: BugTableProps) {
  const allSelected =
    bugs.length > 0 &&
    selectedBugIds.length === bugs.length;

  const someSelected =
    selectedBugIds.length > 0 &&
    selectedBugIds.length < bugs.length;

  function handleSelectAll(
    checked: boolean,
  ) {
    if (checked) {
      onSelectionChange(
        bugs.map((bug) => bug.id),
      );
    } else {
      onSelectionChange([]);
    }
  }

  function handleSelectBug(
    bugId: number,
    checked: boolean,
  ) {
    if (checked) {
      onSelectionChange([
        ...selectedBugIds,
        bugId,
      ]);
      return;
    }

    onSelectionChange(
      selectedBugIds.filter(
        (id) => id !== bugId,
      ),
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(event) =>
                  handleSelectAll(
                    event.target.checked,
                  )
                }
              />
            </TableCell>

            <TableCell>Bug Code</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Test Case</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assigned To</TableCell>

            <TableCell
              width="140"
              align="center"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {bugs.map((bug) => {
            const selected =
              selectedBugIds.includes(
                bug.id,
              );

            const canRetest =
              bug.status === "Fixed" ||
              bug.status === "Ready for QA";

            return (
              <TableRow
                key={bug.id}
                hover
                selected={selected}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected}
                    onChange={(event) =>
                      handleSelectBug(
                        bug.id,
                        event.target.checked,
                      )
                    }
                  />
                </TableCell>

                <TableCell>
                  {bug.bug_code}
                </TableCell>

                <TableCell>
                  {bug.title}
                </TableCell>

                <TableCell>
                  {
                    bug.execution
                      .test_case
                      .test_case_code
                  }
                  {" - "}
                  {
                    bug.execution
                      .test_case
                      .title
                  }
                </TableCell>

                <TableCell>
                  <Chip
                    label={bug.severity}
                    color={getSeverityColor(
                      bug.severity,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {bug.priority}
                </TableCell>

                <TableCell>
                  <Chip
                    label={bug.status}
                    color={getStatusColor(
                      bug.status,
                    )}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {bug.assigned_to ?? "-"}
                </TableCell>

                <TableCell align="center">
                  {canRetest && (
                    <IconButton
                      color="success"
                      onClick={() =>
                        onRetest(bug)
                      }
                      title="Retest"
                    >
                      <ReplayIcon />
                    </IconButton>
                  )}

                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(bug)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(bug)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}