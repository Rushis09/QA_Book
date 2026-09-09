import {
  Box,
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
  Tooltip,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Requirement } from "../../types/requirement";

interface RequirementTableProps {
  requirements: Requirement[];

  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;

  onEdit: (requirement: Requirement) => void;
  onDelete: (requirement: Requirement) => void;
}

function getPriorityStyle(
  priority: string,
) {
  switch (priority) {
    case "High":
      return {
        background: "#fef3f2",
        color: "#b42318",
      };

    case "Medium":
      return {
        background: "#fffaeb",
        color: "#b54708",
      };

    case "Low":
      return {
        background: "#ecfdf3",
        color: "#027a48",
      };

    default:
      return {
        background: "#f2f4f7",
        color: "#475467",
      };
  }
}

function getStatusStyle(
  status: string,
) {
  switch (status) {
    case "Approved":
      return {
        background: "#eff8ff",
        color: "#175cd3",
      };

    case "Implemented":
      return {
        background: "#ecfdf3",
        color: "#027a48",
      };

    default:
      return {
        background: "#f2f4f7",
        color: "#475467",
      };
  }
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

export default function RequirementTable({
  requirements,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: RequirementTableProps) {
  const allSelected =
    requirements.length > 0 &&
    selectedIds.length ===
      requirements.length;

  const someSelected =
    selectedIds.length > 0 &&
    !allSelected;

  function handleSelectAll(
    checked: boolean,
  ) {
    if (checked) {
      onSelectionChange(
        requirements.map(
          (requirement) =>
            requirement.id,
        ),
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
          (selectedId) =>
            selectedId !== id,
        ),
      );
    }
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border:
          "1px solid #e4e7ec",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 980,
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor:
                "#f8fafc",
            }}
          >
            <TableCell
              padding="checkbox"
              sx={{
                width: 48,
                borderBottom:
                  "1px solid #e4e7ec",
              }}
            >
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={
                  someSelected
                }
                onChange={(event) =>
                  handleSelectAll(
                    event.target.checked,
                  )
                }
              />
            </TableCell>

            {[
              "Requirement",
              "Project",
              "Module",
              "Priority",
              "Status",
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
                  fontSize:
                    "0.66rem",
                  fontWeight: 750,
                  color: "#667085",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.045em",
                  whiteSpace:
                    "nowrap",
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
          {requirements.map(
            (requirement) => {
              const priorityStyle =
                getPriorityStyle(
                  requirement.priority,
                );

              const statusStyle =
                getStatusStyle(
                  requirement.status,
                );

              return (
                <TableRow
                  key={
                    requirement.id
                  }
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
                    padding="checkbox"
                    sx={{
                      py: 0.8,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(
                        requirement.id,
                      )}
                      onChange={(
                        event,
                      ) =>
                        handleSelectRow(
                          requirement.id,
                          event.target
                            .checked,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1,
                      px: 1.4,
                      minWidth: 240,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize:
                            "0.76rem",
                          lineHeight:
                            1.2,
                          fontWeight: 700,
                          color:
                            "#101828",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          requirement.requirement_code
                        }
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          maxWidth: 300,
                          fontSize:
                            "0.68rem",
                          lineHeight:
                            1.35,
                          color:
                            "#667085",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                        title={
                          requirement.description ??
                          undefined
                        }
                      >
                        {requirement.description ||
                          "No description"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1,
                      px: 1.4,
                      minWidth: 180,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "0.72rem",
                        fontWeight: 650,
                        color:
                          "#344054",
                        whiteSpace:
                          "nowrap",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        maxWidth: 210,
                      }}
                    >
                      {
                        requirement
                          .project
                          .project_code
                      }
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.15,
                        fontSize:
                          "0.65rem",
                        color:
                          "#667085",
                        whiteSpace:
                          "nowrap",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        maxWidth: 210,
                      }}
                    >
                      {
                        requirement
                          .project
                          .name
                      }
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1,
                      px: 1.4,
                      fontSize:
                        "0.72rem",
                      color:
                        "#475467",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {requirement.module ||
                      "-"}
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1,
                      px: 1.4,
                    }}
                  >
                    <Chip
                      label={
                        requirement.priority
                      }
                      size="small"
                      sx={{
                        height: 22,
                        borderRadius:
                          "6px",
                        backgroundColor:
                          priorityStyle.background,
                        color:
                          priorityStyle.color,
                        fontSize:
                          "0.64rem",
                        fontWeight: 700,
                        "& .MuiChip-label":
                          {
                            px: 0.85,
                          },
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1,
                      px: 1.4,
                    }}
                  >
                    <Chip
                      label={
                        requirement.status
                      }
                      size="small"
                      sx={{
                        height: 22,
                        borderRadius:
                          "6px",
                        backgroundColor:
                          statusStyle.background,
                        color:
                          statusStyle.color,
                        fontSize:
                          "0.64rem",
                        fontWeight: 700,
                        "& .MuiChip-label":
                          {
                            px: 0.85,
                          },
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1,
                      px: 1.4,
                      fontSize:
                        "0.69rem",
                      color:
                        "#667085",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {formatUpdatedDate(
                      requirement.updated_at,
                    )}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      py: 0.55,
                      px: 0.8,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: 0.25,
                      }}
                    >
                      <Tooltip title="Edit requirement">
                        <span>
                          <IconButton
                            size="small"
                            disabled={
                              selectedIds.length >
                              0
                            }
                            onClick={() =>
                              onEdit(
                                requirement,
                              )
                            }
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius:
                                "7px",
                              color:
                                "#475467",
                              "&:hover":
                                {
                                  backgroundColor:
                                    "#eef4ff",
                                  color:
                                    "#356dff",
                                },
                            }}
                          >
                            <EditIcon
                              sx={{
                                fontSize:
                                  16,
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Delete requirement">
                        <span>
                          <IconButton
                            size="small"
                            disabled={
                              selectedIds.length >
                              0
                            }
                            onClick={() =>
                              onDelete(
                                requirement,
                              )
                            }
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius:
                                "7px",
                              color:
                                "#667085",
                              "&:hover":
                                {
                                  backgroundColor:
                                    "#fef2f2",
                                  color:
                                    "#d92d20",
                                },
                            }}
                          >
                            <DeleteIcon
                              sx={{
                                fontSize:
                                  16,
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            },
          )}

          {requirements.length ===
            0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                align="center"
                sx={{
                  py: 6,
                  borderBottom: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      "0.8rem",
                    fontWeight: 650,
                    color:
                      "#475467",
                  }}
                >
                  No requirements found.
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize:
                      "0.7rem",
                    color:
                      "#98a2b3",
                  }}
                >
                  Create a requirement
                  or generate one
                  with AI to get
                  started.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}