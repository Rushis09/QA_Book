import {
  Add,
  Edit,
  LockReset,
  Refresh,
  Search,
  ToggleOff,
  ToggleOn,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import {
  type AdminUser,
  type AdminUserCreateRequest,
  type AdminUserUpdateRequest,
} from "../../services/administrationService";
import administrationService from "../../services/administrationService";
import { useNotification } from "../../contexts/NotificationContext";

const ROLE_OPTIONS = ["USER", "PLATFORM_ADMIN"];

const emptyForm = {
  username: "",
  email: "",
  role: "USER",
  password: "",
};

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const typedError = error as {
      response?: {
        data?: {
          detail?: unknown;
        };
      };
      message?: unknown;
    };

    const detail =
      typedError.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (
      typeof typedError.message === "string" &&
      typedError.message.trim()
    ) {
      return typedError.message;
    }
  }

  return fallback;
}

export default function AdministrationUsersPage() {
  const { showNotification } = useNotification();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] =
    useState<AdminUser | null>(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [passwordOpen, setPasswordOpen] =
    useState(false);

  const [passwordUser, setPasswordUser] =
    useState<AdminUser | null>(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  async function loadUsers(
    showSuccess = false,
  ) {
    setLoading(true);

    try {
      const data =
        await administrationService.getUsers();

      setUsers(data);

      if (showSuccess) {
        showNotification(
          "User directory refreshed successfully.",
          "success",
        );
      }
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to load platform users.",
        ),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.username
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          user.is_active) ||
        (statusFilter === "INACTIVE" &&
          !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  function openCreateDialog() {
    setEditingUser(null);
    setForm({
      ...emptyForm,
    });
    setShowPassword(false);
    setFormOpen(true);
  }

  function openEditDialog(user: AdminUser) {
    setEditingUser(user);

    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    });

    setShowPassword(false);
    setFormOpen(true);
  }

  function closeFormDialog() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingUser(null);

    setForm({
      ...emptyForm,
    });

    setShowPassword(false);
  }

  async function handleSaveUser() {
    if (!form.username.trim()) {
      showNotification(
        "Username is required.",
        "warning",
      );
      return;
    }

    if (!form.email.trim()) {
      showNotification(
        "Email address is required.",
        "warning",
      );
      return;
    }

    if (
      !editingUser &&
      form.password.length < 8
    ) {
      showNotification(
        "Temporary password must contain at least 8 characters.",
        "warning",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        const data: AdminUserUpdateRequest = {
          username: form.username.trim(),
          email: form.email.trim(),
          role: form.role,
        };

        const updated =
          await administrationService.updateUser(
            editingUser.id,
            data,
          );

        setUsers((current) =>
          current.map((user) =>
            user.id === editingUser.id
              ? updated
              : user,
          ),
        );

        showNotification(
          `User "${updated.username}" updated successfully.`,
          "success",
        );
      } else {
        const data: AdminUserCreateRequest = {
          username: form.username.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password,
        };

        const created =
          await administrationService.createUser(
            data,
          );

        setUsers((current) => [
          created,
          ...current,
        ]);

        showNotification(
          `User "${created.username}" created successfully.`,
          "success",
        );
      }

      setSaving(false);
      closeFormDialog();
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          editingUser
            ? "Unable to update the user."
            : "Unable to create the user.",
        ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(
    user: AdminUser,
  ) {
    if (statusUpdatingId === user.id) {
      return;
    }

    const nextStatus = !user.is_active;

    setStatusUpdatingId(user.id);

    try {
      const updated =
        await administrationService.updateUserStatus(
          user.id,
          {
            is_active: nextStatus,
          },
        );

      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.id === user.id
            ? updated
            : currentUser,
        ),
      );

      showNotification(
        nextStatus
          ? `User "${updated.username}" activated successfully.`
          : `User "${updated.username}" deactivated successfully.`,
        "success",
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          nextStatus
            ? "Unable to activate the user."
            : "Unable to deactivate the user.",
        ),
        "error",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  function openPasswordDialog(
    user: AdminUser,
  ) {
    setPasswordUser(user);
    setNewPassword("");
    setShowNewPassword(false);
    setPasswordOpen(true);
  }

  function closePasswordDialog() {
    if (saving) {
      return;
    }

    setPasswordOpen(false);
    setPasswordUser(null);
    setNewPassword("");
    setShowNewPassword(false);
  }

  async function handleResetPassword() {
    if (!passwordUser) {
      return;
    }

    if (newPassword.length < 8) {
      showNotification(
        "New password must contain at least 8 characters.",
        "warning",
      );
      return;
    }

    setSaving(true);

    try {
      await administrationService.resetUserPassword(
        passwordUser.id,
        {
          new_password: newPassword,
        },
      );

      showNotification(
        `Password reset successfully for "${passwordUser.username}".`,
        "success",
      );

      setSaving(false);
      closePasswordDialog();
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to reset the user's password.",
        ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  const activeCount = users.filter(
    (user) => user.is_active,
  ).length;

  const inactiveCount =
    users.length - activeCount;

  const platformAdminCount = users.filter(
    (user) => user.role === "PLATFORM_ADMIN",
  ).length;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          border: "1px solid #e4eaf2",
          borderRadius: 2,
          background:
            "linear-gradient(135deg, #ffffff 0%, #f7faff 100%)",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#172033",
                letterSpacing: "-0.02em",
              }}
            >
              Administration
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: "0.82rem",
                color: "#667085",
              }}
            >
              Manage QABook platform users,
              access, and account status.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                md: "auto",
              },
            }}
          >
            <Tooltip title="Refresh user directory">
              <span>
                <IconButton
                  size="small"
                  onClick={() =>
                    void loadUsers(true)
                  }
                  disabled={loading}
                  sx={{
                    border: "1px solid #d9e1ec",
                    borderRadius: 1.5,
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={18}
                    />
                  ) : (
                    <Refresh
                      sx={{ fontSize: 19 }}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateDialog}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
                fontWeight: 650,
                boxShadow: "none",
                flex: {
                  xs: 1,
                  md: "initial",
                },
              }}
            >
              Add User
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Platform summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.25,
          mb: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            border: "1px solid #e4eaf2",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "#667085",
              fontWeight: 600,
            }}
          >
            Total Users
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: "1.35rem",
              fontWeight: 750,
              color: "#172033",
            }}
          >
            {users.length}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            border: "1px solid #e4eaf2",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "#667085",
              fontWeight: 600,
            }}
          >
            Active Users
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: "1.35rem",
              fontWeight: 750,
              color: "#157347",
            }}
          >
            {activeCount}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            border: "1px solid #e4eaf2",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "#667085",
              fontWeight: 600,
            }}
          >
            Inactive Users
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: "1.35rem",
              fontWeight: 750,
              color: "#667085",
            }}
          >
            {inactiveCount}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            border: "1px solid #e4eaf2",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "#667085",
              fontWeight: 600,
            }}
          >
            Platform Admins
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: "1.35rem",
              fontWeight: 750,
              color: "#344054",
            }}
          >
            {platformAdminCount}
          </Typography>
        </Paper>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          border: "1px solid #e4eaf2",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            gap: 1.25,
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search username or email"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        fontSize: 19,
                        color: "#8a94a6",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                md: 170,
              },
            }}
          >
            <InputLabel>Role</InputLabel>

            <Select
              value={roleFilter}
              label="Role"
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <MenuItem value="ALL">
                All roles
              </MenuItem>

              {ROLE_OPTIONS.map((role) => (
                <MenuItem
                  key={role}
                  value={role}
                >
                  {role === "PLATFORM_ADMIN"
                    ? "Platform Admin"
                    : "User"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                md: 170,
              },
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              value={statusFilter}
              label="Status"
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <MenuItem value="ALL">
                All statuses
              </MenuItem>

              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {!loading && (
          <Box
            sx={{
              mt: 1.25,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#98a2b3",
              }}
            >
              Showing {filteredUsers.length} of{" "}
              {users.length} users
            </Typography>

            {(search ||
              roleFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <Button
                size="small"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
                sx={{
                  textTransform: "none",
                  fontSize: "0.72rem",
                  minWidth: "auto",
                  p: 0,
                }}
              >
                Clear filters
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Users table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e4eaf2",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.25,
            }}
          >
            <CircularProgress size={28} />

            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#667085",
              }}
            >
              Loading platform users...
            </Typography>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              gap: 0.75,
            }}
          >
            <Search
              sx={{
                fontSize: 30,
                color: "#98a2b3",
                mb: 0.5,
              }}
            />

            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 650,
                color: "#475467",
              }}
            >
              No users found
            </Typography>

            <Typography
              sx={{
                fontSize: "0.78rem",
                color: "#98a2b3",
                textAlign: "center",
              }}
            >
              Try changing the search or filters.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 850,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475467",
                      py: 1.25,
                    }}
                  >
                    User
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475467",
                    }}
                  >
                    Email
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475467",
                    }}
                  >
                    Role
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#475467",
                    }}
                  >
                    Status
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      color: "#475467",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((user) => {
                  const statusUpdating =
                    statusUpdatingId === user.id;

                  return (
                    <TableRow
                      key={user.id}
                      hover
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.84rem",
                            fontWeight: 650,
                            color: "#172033",
                          }}
                        >
                          {user.username}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.15,
                            fontSize: "0.7rem",
                            color: "#98a2b3",
                          }}
                        >
                          ID #{user.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "#475467",
                          }}
                        >
                          {user.email}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            user.role ===
                            "PLATFORM_ADMIN"
                              ? "Platform Admin"
                              : "User"
                          }
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.68rem",
                            fontWeight: 650,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            user.is_active
                              ? "Active"
                              : "Inactive"
                          }
                          size="small"
                          color={
                            user.is_active
                              ? "success"
                              : "default"
                          }
                          variant="outlined"
                          sx={{
                            fontSize: "0.68rem",
                            fontWeight: 650,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent:
                              "flex-end",
                            alignItems: "center",
                            gap: 0.25,
                          }}
                        >
                          <Tooltip title="Edit user">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openEditDialog(user)
                              }
                            >
                              <Edit
                                sx={{
                                  fontSize: 18,
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              user.is_active
                                ? "Deactivate user"
                                : "Activate user"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={
                                  statusUpdating
                                }
                                onClick={() =>
                                  void handleToggleStatus(
                                    user,
                                  )
                                }
                              >
                                {statusUpdating ? (
                                  <CircularProgress
                                    size={19}
                                  />
                                ) : user.is_active ? (
                                  <ToggleOn
                                    sx={{
                                      fontSize: 21,
                                    }}
                                  />
                                ) : (
                                  <ToggleOff
                                    sx={{
                                      fontSize: 21,
                                    }}
                                  />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Reset password">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openPasswordDialog(
                                  user,
                                )
                              }
                            >
                              <LockReset
                                sx={{
                                  fontSize: 19,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create / Edit User */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#172033",
            }}
          >
            {editingUser
              ? "Edit User"
              : "Create User"}
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: "0.75rem",
              color: "#667085",
            }}
          >
            {editingUser
              ? "Update platform access and account details."
              : "Create a new QABook platform account."}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ pt: 1 }}
          >
            <TextField
              fullWidth
              label="Username"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  username:
                    event.target.value,
                }))
              }
              autoFocus
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email:
                    event.target.value,
                }))
              }
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>

              <Select
                value={form.role}
                label="Role"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem
                    key={role}
                    value={role}
                  >
                    {role === "PLATFORM_ADMIN"
                      ? "Platform Admin"
                      : "User"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!editingUser && (
              <TextField
                fullWidth
                label="Temporary Password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password:
                      event.target.value,
                  }))
                }
                helperText="Minimum 8 characters"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current,
                            )
                          }
                          onMouseDown={(event) =>
                            event.preventDefault()
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closeFormDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleSaveUser()
            }
            disabled={
              saving ||
              !form.username.trim() ||
              !form.email.trim() ||
              (!editingUser &&
                form.password.length < 8)
            }
            sx={{
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            {saving
              ? "Saving..."
              : editingUser
                ? "Save Changes"
                : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset */}
      <Dialog
        open={passwordOpen}
        onClose={closePasswordDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#172033",
            }}
          >
            Reset User Password
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: "0.75rem",
              color: "#667085",
            }}
          >
            Set a new password for the selected
            platform account.
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={1.5}
            sx={{ pt: 1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: "1px solid #e4eaf2",
                backgroundColor: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: "#667085",
                }}
              >
                Account
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: "0.86rem",
                  fontWeight: 650,
                  color: "#172033",
                }}
              >
                {passwordUser?.username}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: "#98a2b3",
                }}
              >
                {passwordUser?.email}
              </Typography>
            </Paper>

            <TextField
              fullWidth
              label="New Password"
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              helperText="Minimum 8 characters"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={
                          showNewPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() =>
                          setShowNewPassword(
                            (current) =>
                              !current,
                          )
                        }
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                      >
                        {showNewPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closePasswordDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleResetPassword()
            }
            disabled={
              saving ||
              newPassword.length < 8
            }
            sx={{
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            {saving
              ? "Resetting..."
              : "Reset Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}