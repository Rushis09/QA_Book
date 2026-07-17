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
} from "@mui/material";

import type { Requirement } from "../../types/requirement";

interface RequirementTableProps {
  requirements: Requirement[];

  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;

  onEdit: (requirement: Requirement) => void;
  onDelete: (requirement: Requirement) => void;
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

export default function RequirementTable({
  requirements,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: RequirementTableProps) {

  const allSelected =
    requirements.length > 0 &&
    selectedIds.length === requirements.length;

  const someSelected =
    selectedIds.length > 0 && !allSelected;

  function handleSelectAll(
    checked: boolean,
  ) {
    if (checked) {
      onSelectionChange(
        requirements.map((r) => r.id),
      );
    } else {
      onSelectionChange([]);
    }
  }

  function handleSelectRow(
    id: number,
    checked: boolean,
  ) {
    if (checked) {
      onSelectionChange([
        ...selectedIds,
        id,
      ]);
    } else {
      onSelectionChange(
        selectedIds.filter(
          (selectedId) => selectedId !== id,
        ),
      );
    }
  }

  return (

    <TableContainer
      component={Paper}
      sx={{
        flex: 1,
        overflow: "auto",
      }}
    >
      <Table stickyHeader>
        <TableHead>
  <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(event) =>
                  handleSelectAll(event.target.checked)
                }
              />
            </TableCell>
              
            <TableCell>Requirement Code</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Module</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {requirements.map((requirement) => (
            <TableRow key={requirement.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.includes(
                    requirement.id,
                  )}
                  onChange={(event) =>
                    handleSelectRow(
                      requirement.id,
                      event.target.checked,
                    )
                  }
                />
              </TableCell>
                
              <TableCell>
                {requirement.requirement_code}
              </TableCell>

              <TableCell>
                {`${requirement.project.project_code} - ${requirement.project.name}`}
              </TableCell>

              <TableCell>
                {requirement.module}
              </TableCell>

              <TableCell>
                <Chip
                  label={requirement.priority}
                  color={getPriorityColor(
                    requirement.priority,
                  )}
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={requirement.status}
                  color={getStatusColor(
                    requirement.status,
                  )}
                  size="small"
                />
              </TableCell>

              <TableCell>
                {requirement.description ?? "-"}
              </TableCell>

              <TableCell align="right">
                <IconButton
                  color="primary"
                  disabled={selectedIds.length > 0}
                  onClick={() => onEdit(requirement)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  disabled={selectedIds.length > 0}
                  onClick={() => onDelete(requirement)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {requirements.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                align="center"
              >
                No requirements found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}