import { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplayIcon from "@mui/icons-material/Replay";

import {
  Box,
  Checkbox,
  Chip,
  Collapse,
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

function getSeverityStyles(
  severity: string,
) {
  switch (severity) {
    case "Critical":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "High":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    case "Medium":
      return {
        color: "#175cd3",
        backgroundColor: "#eff8ff",
        borderColor: "#b2ddff",
      };

    case "Low":
      return {
        color: "#067647",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

function getStatusStyles(
  status: string,
) {
  switch (status) {
    case "Open":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "In Progress":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    case "Ready for QA":
      return {
        color: "#175cd3",
        backgroundColor: "#eff8ff",
        borderColor: "#b2ddff",
      };

    case "Fixed":
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#d0d5dd",
      };

    case "Closed":
      return {
        color: "#067647",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

function getPriorityStyles(
  priority: string,
) {
  switch (priority) {
    case "Critical":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "High":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    case "Medium":
      return {
        color: "#175cd3",
        backgroundColor: "#eff8ff",
        borderColor: "#b2ddff",
      };

    case "Low":
      return {
        color: "#067647",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

function DetailBlock({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | null;
  fullWidth?: boolean;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth
          ? "1 / -1"
          : undefined,
        px: 1.2,
        py: 1,
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        border:
          "1px solid #eaecf0",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.63rem",
          fontWeight: 800,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.045em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.71rem",
          lineHeight: 1.5,
          color: "#344054",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value?.trim() || "-"}
      </Typography>
    </Box>
  );
}

const headerSx = {
  py: 1,
  px: 1.25,
  fontSize: "0.64rem",
  fontWeight: 800,
  color: "#667085",
  textTransform: "uppercase" as const,
  letterSpacing: "0.045em",
  whiteSpace: "nowrap" as const,
};

export default function BugTable({
  bugs,
  selectedBugIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onRetest,
}: BugTableProps) {
  const [
    expandedBugId,
    setExpandedBugId,
  ] = useState<number | null>(null);

  const [
    menuAnchor,
    setMenuAnchor,
  ] = useState<null | HTMLElement>(
    null,
  );

  const [
    menuBug,
    setMenuBug,
  ] = useState<Bug | null>(null);

  const allSelected =
    bugs.length > 0 &&
    selectedBugIds.length ===
      bugs.length;

  const someSelected =
    selectedBugIds.length > 0 &&
    selectedBugIds.length <
      bugs.length;

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

  function toggleExpanded(
    bugId: number,
  ) {
    setExpandedBugId(
      (current) =>
        current === bugId
          ? null
          : bugId,
    );
  }

  function handleOpenMenu(
    event: React.MouseEvent<HTMLElement>,
    bug: Bug,
  ) {
    setMenuAnchor(
      event.currentTarget,
    );
    setMenuBug(bug);
  }

  function handleCloseMenu() {
    setMenuAnchor(null);
    setMenuBug(null);
  }

  function handleMenuEdit() {
    if (!menuBug) {
      return;
    }

    const bug = menuBug;

    handleCloseMenu();
    onEdit(bug);
  }

  function handleMenuDelete() {
    if (!menuBug) {
      return;
    }

    const bug = menuBug;

    handleCloseMenu();
    onDelete(bug);
  }

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: "11px",
          borderColor: "#e4e7ec",
          boxShadow:
            "0 1px 2px rgba(16, 24, 40, 0.04)",
          overflow: "hidden",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 1050,
            "& .MuiTableCell-root": {
              borderColor: "#eaecf0",
            },
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
                  px: 1,
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
                      event.target
                        .checked,
                    )
                  }
                />
              </TableCell>

              <TableCell
                sx={{
                  width: 48,
                  px: 0.5,
                }}
              />

              <TableCell sx={headerSx}>
                Bug
              </TableCell>

              <TableCell sx={headerSx}>
                Title
              </TableCell>

              <TableCell sx={headerSx}>
                Test Case
              </TableCell>

              <TableCell sx={headerSx}>
                Severity
              </TableCell>

              <TableCell sx={headerSx}>
                Priority
              </TableCell>

              <TableCell sx={headerSx}>
                Status
              </TableCell>

              <TableCell sx={headerSx}>
                Assigned To
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerSx,
                  width: 125,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {bugs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  align="center"
                  sx={{
                    py: 5,
                    borderBottom:
                      "none",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize:
                          "0.82rem",
                        fontWeight: 750,
                        color:
                          "#344054",
                      }}
                    >
                      No bugs found
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
                      Try adjusting
                      your search or
                      filters.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              bugs.map((bug) => {
                const selected =
                  selectedBugIds.includes(
                    bug.id,
                  );

                const expanded =
                  expandedBugId ===
                  bug.id;

                const canRetest =
                  bug.status ===
                    "Fixed" ||
                  bug.status ===
                    "Ready for QA";

                const severityStyles =
                  getSeverityStyles(
                    bug.severity,
                  );

                const priorityStyles =
                  getPriorityStyles(
                    bug.priority,
                  );

                const statusStyles =
                  getStatusStyles(
                    bug.status,
                  );

                return (
                  <>
                    <TableRow
                      key={bug.id}
                      hover
                      selected={
                        selected
                      }
                      sx={{
                        backgroundColor:
                          expanded
                            ? "#fcfdff"
                            : "#fff",
                        "&:hover": {
                          backgroundColor:
                            "#f9fafb",
                        },
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        sx={{
                          px: 1,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={
                            selected
                          }
                          onChange={(
                            event,
                          ) =>
                            handleSelectBug(
                              bug.id,
                              event
                                .target
                                .checked,
                            )
                          }
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          px: 0.5,
                        }}
                      >
                        <Tooltip
                          title={
                            expanded
                              ? "Collapse details"
                              : "View bug details"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              toggleExpanded(
                                bug.id,
                              )
                            }
                            sx={{
                              width: 28,
                              height: 28,
                              border:
                                "1px solid #e4e7ec",
                              borderRadius:
                                "7px",
                              color:
                                "#667085",
                              backgroundColor:
                                "#fff",
                            }}
                          >
                            {expanded ? (
                              <ExpandLessIcon
                                sx={{
                                  fontSize:
                                    17,
                                }}
                              />
                            ) : (
                              <ExpandMoreIcon
                                sx={{
                                  fontSize:
                                    17,
                                }}
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.73rem",
                            fontWeight: 800,
                            color:
                              "#155eef",
                          }}
                        >
                          {
                            bug.bug_code
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            maxWidth: 210,
                            fontSize:
                              "0.73rem",
                            fontWeight: 750,
                            color:
                              "#101828",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {bug.title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.71rem",
                            fontWeight: 700,
                            color:
                              "#344054",
                          }}
                        >
                          {
                            bug
                              .execution
                              .test_case
                              .test_case_code
                          }
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.15,
                            maxWidth: 190,
                            fontSize:
                              "0.66rem",
                            color:
                              "#667085",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            bug
                              .execution
                              .test_case
                              .title
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            bug.severity
                          }
                          size="small"
                          sx={{
                            height: 23,
                            borderRadius:
                              "6px",
                            fontSize:
                              "0.63rem",
                            fontWeight:
                              750,
                            color:
                              severityStyles.color,
                            backgroundColor:
                              severityStyles.backgroundColor,
                            border:
                              `1px solid ${severityStyles.borderColor}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            bug.priority
                          }
                          size="small"
                          sx={{
                            height: 23,
                            borderRadius:
                              "6px",
                            fontSize:
                              "0.63rem",
                            fontWeight:
                              700,
                            color:
                              priorityStyles.color,
                            backgroundColor:
                              priorityStyles.backgroundColor,
                            border:
                              `1px solid ${priorityStyles.borderColor}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            bug.status
                          }
                          size="small"
                          sx={{
                            height: 23,
                            borderRadius:
                              "6px",
                            fontSize:
                              "0.63rem",
                            fontWeight:
                              750,
                            color:
                              statusStyles.color,
                            backgroundColor:
                              statusStyles.backgroundColor,
                            border:
                              `1px solid ${statusStyles.borderColor}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize:
                              "0.68rem",
                            fontWeight:
                              bug.assigned_to
                                ? 650
                                : 400,
                            color:
                              bug.assigned_to
                                ? "#344054"
                                : "#98a2b3",
                          }}
                        >
                          {bug.assigned_to ||
                            "-"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        <Box
                          sx={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            alignItems:
                              "center",
                            gap: 0.35,
                          }}
                        >
                          {canRetest && (
                            <Tooltip title="Retest">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  onRetest(
                                    bug,
                                  )
                                }
                                sx={{
                                  width: 30,
                                  height: 30,
                                  color:
                                    "#067647",
                                  border:
                                    "1px solid #abefc6",
                                  borderRadius:
                                    "7px",
                                  backgroundColor:
                                    "#f6fef9",
                                }}
                              >
                                <ReplayIcon
                                  sx={{
                                    fontSize:
                                      17,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Edit Bug">
                            <IconButton
                              size="small"
                              onClick={() =>
                                onEdit(
                                  bug,
                                )
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                color:
                                  "#1570ef",
                                border:
                                  "1px solid #d0d5dd",
                                borderRadius:
                                  "7px",
                                backgroundColor:
                                  "#fff",
                              }}
                            >
                              <EditIcon
                                sx={{
                                  fontSize:
                                    17,
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="More actions">
                            <IconButton
                              size="small"
                              onClick={(
                                event,
                              ) =>
                                handleOpenMenu(
                                  event,
                                  bug,
                                )
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                color:
                                  "#667085",
                                border:
                                  "1px solid #d0d5dd",
                                borderRadius:
                                  "7px",
                                backgroundColor:
                                  "#fff",
                              }}
                            >
                              <MoreVertIcon
                                sx={{
                                  fontSize:
                                    18,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>

                    <TableRow
                      key={`${bug.id}-details`}
                    >
                      <TableCell
                        colSpan={10}
                        sx={{
                          p: 0,
                          borderBottom:
                            expanded
                              ? "1px solid #eaecf0"
                              : "none",
                        }}
                      >
                        <Collapse
                          in={expanded}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              px: 2,
                              py: 1.4,
                              backgroundColor:
                                "#fcfdff",
                              borderTop:
                                "1px solid #f2f4f7",
                            }}
                          >
                            <Box
                              sx={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  {
                                    xs: "1fr",
                                    md: "repeat(2, minmax(0, 1fr))",
                                  },
                                gap: 0.8,
                              }}
                            >
                              <DetailBlock
                                label="Description"
                                value={
                                  bug.description
                                }
                              />

                              <DetailBlock
                                label="Environment"
                                value={
                                  bug.environment
                                }
                              />

                              <DetailBlock
                                label="Steps to Reproduce"
                                value={
                                  bug.steps_to_reproduce
                                }
                                fullWidth
                              />

                              <DetailBlock
                                label="Actual Result"
                                value={
                                  bug.actual_result
                                }
                              />

                              <DetailBlock
                                label="Resolution"
                                value={
                                  bug.resolution
                                }
                              />

                              <DetailBlock
                                label="Reported By"
                                value={
                                  bug.reported_by
                                }
                              />
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 145,
              borderRadius: "8px",
              border:
                "1px solid #eaecf0",
              boxShadow:
                "0 8px 24px rgba(16, 24, 40, 0.12)",
              "& .MuiMenuItem-root": {
                minHeight: 34,
                px: 1.2,
                fontSize: "0.7rem",
                borderRadius: "5px",
                mx: 0.35,
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={handleMenuEdit}
        >
          <EditIcon
            sx={{
              mr: 1,
              fontSize: 16,
              color: "#667085",
            }}
          />
          Edit Bug
        </MenuItem>

        <MenuItem
          onClick={handleMenuDelete}
          sx={{
            color: "#b42318",
          }}
        >
          <DeleteIcon
            sx={{
              mr: 1,
              fontSize: 16,
              color: "#b42318",
            }}
          />
          Delete Bug
        </MenuItem>
      </Menu>
    </>
  );
}