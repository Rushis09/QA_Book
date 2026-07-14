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

import type { Requirement } from "../../types/requirement";

interface RequirementTableProps {
  requirements: Requirement[];
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
  onEdit,
  onDelete,
}: RequirementTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
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
            <TableRow key={requirement.id}>
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
                  onClick={() => onEdit(requirement)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
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
                colSpan={7}
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