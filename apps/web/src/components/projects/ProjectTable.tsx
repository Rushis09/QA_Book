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

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import type { Project } from "../../types/project";

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onExport: (project: Project) => void;
}

export default function ProjectTable({
  projects,
  onEdit,
  onDelete,
  onExport,
}: ProjectTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Description</TableCell>

            <TableCell
              width="100"
              align="center"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              hover
            >
              <TableCell>
                {project.project_code}
              </TableCell>

              <TableCell>
                {project.name}
              </TableCell>

              <TableCell>
                <Chip
                  label={project.status}
                  color={
                    project.status === "Active"
                      ? "success"
                      : project.status === "Completed"
                        ? "primary"
                        : project.status === "On Hold"
                          ? "warning"
                          : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                {project.version ?? "-"}
              </TableCell>

              <TableCell>
                {project.start_date ?? "-"}
              </TableCell>

              <TableCell>
                {project.end_date ?? "-"}
              </TableCell>

              <TableCell>
                {project.description ?? "-"}
              </TableCell>

              <TableCell align="center">
                <IconButton
                  color="primary"
                  onClick={() => onEdit(project)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => onDelete(project)}
                >
                  <DeleteIcon />
                </IconButton>

                <IconButton
                  color="success"
                  onClick={() => onExport(project)}
                >
                  <FileDownloadIcon />
                </IconButton>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}