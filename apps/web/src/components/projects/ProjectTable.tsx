import { useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";
import type { Project } from "../../types/project";

interface ProjectMetrics {
  qaProgress: number | null;
  automationConnected: boolean;
  mappedCount: number;
}

interface ProjectTableProps {
  projects: Project[];
  metrics: Record<number, ProjectMetrics>;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDocuments: (project: Project) => void;
}

export default function ProjectTable({
  projects,
  metrics,
  onEdit,
  onDelete,
  onDocuments,
}: ProjectTableProps) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  function handleOpenMenu(
    event: MouseEvent<HTMLElement>,
    project: Project,
  ) {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
    setSelectedProject(null);
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e4e7ec",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 900,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f8fafc",
              }}
            >
              {[
                "Project",
                "Status",
                "Version",
                "QA Progress",
                "Automation",
                "Updated",
                "Actions",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  align={
                    heading === "Actions"
                      ? "center"
                      : "left"
                  }
                  sx={{
                    py: 1,
                    px: 1.4,
                    fontSize: "0.66rem",
                    fontWeight: 750,
                    color: "#667085",
                    textTransform: "uppercase",
                    letterSpacing: "0.045em",
                    whiteSpace: "nowrap",
                    borderBottom:
                      "1px solid #e4e7ec",
                  }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.map((project) => {
              const projectMetrics =
                metrics[project.id];

              const qaProgress =
                projectMetrics?.qaProgress ??
                null;

              const automationConnected =
                projectMetrics?.automationConnected ??
                false;

              const mappedCount =
                projectMetrics?.mappedCount ??
                0;

              return (
                <TableRow
                  key={project.id}
                  hover
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                    "&:hover": {
                      backgroundColor:
                        "#f8fbff",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      py: 1.05,
                      px: 1.4,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 210,
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "8px",
                          backgroundColor:
                            "#eef2ff",
                          color: "#4f46e5",
                          fontSize: "0.7rem",
                          fontWeight: 750,
                        }}
                      >
                        {project.name
                          .charAt(0)
                          .toUpperCase()}
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.76rem",
                            lineHeight: 1.2,
                            fontWeight: 700,
                            color: "#101828",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {project.project_code}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: "0.68rem",
                            lineHeight: 1.2,
                            color: "#667085",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            maxWidth: 250,
                          }}
                        >
                          {project.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1.05,
                      px: 1.4,
                    }}
                  >
                    <StatusBadge
                      status={project.status}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1.05,
                      px: 1.4,
                      fontSize: "0.73rem",
                      color: "#475467",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {project.version ?? "—"}
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1.05,
                      px: 1.4,
                      minWidth: 150,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.9,
                      }}
                    >
                      <Box
                        sx={{
                          width: 62,
                          height: 5,
                          overflow: "hidden",
                          borderRadius: 10,
                          backgroundColor:
                            "#e4e7ec",
                        }}
                      >
                        {qaProgress !==
                          null && (
                          <Box
                            sx={{
                              width: `${qaProgress}%`,
                              height: "100%",
                              borderRadius: 10,
                              backgroundColor:
                                qaProgress >=
                                75
                                  ? "#12b76a"
                                  : qaProgress >=
                                      50
                                    ? "#f79009"
                                    : "#f04438",
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "0.69rem",
                          fontWeight: 650,
                          color:
                            qaProgress !==
                            null
                              ? "#344054"
                              : "#98a2b3",
                        }}
                      >
                        {qaProgress !==
                        null
                          ? `${qaProgress}%`
                          : "Not run"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1.05,
                      px: 1.4,
                    }}
                  >
                    {automationConnected ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.7,
                        }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor:
                              "#12b76a",
                          }}
                        />

                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.69rem",
                              lineHeight: 1.15,
                              fontWeight: 700,
                              color: "#027a48",
                            }}
                          >
                            Connected
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.15,
                              fontSize: "0.61rem",
                              color: "#667085",
                            }}
                          >
                            {mappedCount} mapped
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#667085",
                        }}
                      >
                        Not configured
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1.05,
                      px: 1.4,
                      fontSize: "0.69rem",
                      color: "#667085",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatUpdatedDate(
                      project.updated_at,
                    )}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      py: 0.55,
                      px: 0.8,
                    }}
                  >
                    <Tooltip title="Project actions">
                      <IconButton
                        size="small"
                        onClick={(event) =>
                          handleOpenMenu(
                            event,
                            project,
                          )
                        }
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: "7px",
                          border:
                            "1px solid #e4e7ec",
                          color: "#475467",
                          "&:hover": {
                            backgroundColor:
                              "#f8fafc",
                          },
                        }}
                      >
                        <MoreVertIcon
                          sx={{
                            fontSize: 17,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {projects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{
                    py: 6,
                    color: "#667085",
                    fontSize: "0.78rem",
                  }}
                >
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 190,
              mt: 0.5,
              border: "1px solid #e4e7ec",
              borderRadius: "9px",
              boxShadow:
                "0 8px 24px rgba(16,24,40,0.10)",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedProject) {
              navigate(
                `/projects/${selectedProject.id}`,
              );
            }

            handleCloseMenu();
          }}
          sx={{
            fontSize: "0.76rem",
            fontWeight: 650,
            gap: 1,
          }}
        >
          <FolderOutlinedIcon
            sx={{ fontSize: 16 }}
          />
          Open Workspace
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedProject) {
              onEdit(selectedProject);
            }

            handleCloseMenu();
          }}
          sx={{
            fontSize: "0.76rem",
            gap: 1,
          }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
          Edit Project
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedProject) {
              onDocuments(selectedProject);
            }

            handleCloseMenu();
          }}
          sx={{
            fontSize: "0.76rem",
            gap: 1,
          }}
        >
          <DescriptionOutlinedIcon
            sx={{ fontSize: 16 }}
          />
          Documents / BRD
        </MenuItem>

        <Box
          sx={{
            mx: 1,
            my: 0.5,
            borderTop: "1px solid #eaecf0",
          }}
        />

        <MenuItem
          onClick={() => {
            if (selectedProject) {
              onDelete(selectedProject);
            }

            handleCloseMenu();
          }}
          sx={{
            fontSize: "0.76rem",
            color: "#d92d20",
            gap: 1,
          }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
          Delete Project
        </MenuItem>
      </Menu>
    </>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    status === "Active"
      ? {
          background: "#ecfdf3",
          color: "#027a48",
        }
      : status === "Completed"
        ? {
            background: "#eff8ff",
            color: "#175cd3",
          }
        : status === "On Hold"
          ? {
              background: "#fffaeb",
              color: "#b54708",
            }
          : {
              background: "#f2f4f7",
              color: "#475467",
            };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        height: 22,
        borderRadius: "6px",
        backgroundColor: config.background,
        color: config.color,
        fontSize: "0.64rem",
        fontWeight: 700,
        "& .MuiChip-label": {
          px: 0.85,
        },
      }}
    />
  );
}

function formatUpdatedDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const now = new Date();

  const diffDays = Math.floor(
    (now.getTime() -
      date.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  if (diffDays < 14) {
    return "1 week ago";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}