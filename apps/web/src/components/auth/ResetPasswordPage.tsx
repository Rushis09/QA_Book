import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";


import api from "../../services/api";


export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");

    if (!resetToken) {
      setError(
        "This password reset link is invalid or incomplete.",
      );
      return;
    }

    setToken(resetToken);
  }, [searchParams]);

  const handleResetPassword = async () => {
    if (!token) {
      setError(
        "This password reset link is invalid or incomplete.",
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError(
        "Please enter and confirm your new password.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        "/auth/reset-password",
        {
          token,
          new_password: password,
        },
      );

      setSuccess(true);
    } catch (resetError: any) {
      console.error(resetError);

      const detail =
        resetError?.response?.data?.detail;

      setError(
        detail ||
          "Unable to reset your password. Please request a new reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f7f9fc",
      }}
    >
      {/* Left branding panel */}

      <Box
        sx={{
          width: {
            xs: "100%",
            md: "50%",
            lg: "46%",
          },
          minHeight: "100vh",
          display: {
            xs: "none",
            md: "flex",
          },
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          color: "white",
          background:
            "linear-gradient(145deg, #273fc7 0%, #2867df 55%, #2478ed 100%)",
          px: {
            md: 6,
            lg: 8,
          },
          py: 4,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.08)",
            right: -220,
            bottom: -100,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            QABook
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              opacity: 0.8,
            }}
          >
            Plan • Design • Test • Deliver
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: {
              md: 10,
              lg: 14,
            },
            maxWidth: 540,
          }}
        >
          <Typography
            sx={{
              fontSize: {
                md: "2.6rem",
                lg: "3.25rem",
              },
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: "-1.5px",
            }}
          >
            Secure your
            <br />
            QABook account
          </Typography>

          <Typography
            sx={{
              mt: 3,
              maxWidth: 500,
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color:
                "rgba(255,255,255,0.88)",
            }}
          >
            Create a new password and
            get back to managing your QA
            workflow.
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: "auto",
            p: 2.5,
            maxWidth: 520,
            borderRadius: 2,
            border:
              "1px solid rgba(255,255,255,0.18)",
            background:
              "rgba(255,255,255,0.08)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color:
                "rgba(255,255,255,0.88)",
            }}
          >
            Your password reset link is
            time-limited for your security.
          </Typography>
        </Box>
      </Box>

      {/* Right reset panel */}

      <Box
        sx={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          px: {
            xs: 2,
            sm: 4,
            lg: 7,
          },
          py: {
            xs: 3,
            sm: 4,
            lg: 4,
          },
          backgroundColor: "#f8fafc",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 610,
              p: {
                xs: 3,
                sm: 4,
                lg: 5,
              },
              borderRadius: 3,
              border:
                "1px solid #dfe6ef",
              boxShadow:
                "0 18px 50px rgba(26, 48, 86, 0.10)",
              backgroundColor: "white",
            }}
          >
            {/* Logo */}

            <Box
              sx={{
                textAlign: "center",
                mb: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "2rem",
                    sm: "2.35rem",
                  },
                  fontWeight: 800,
                  letterSpacing: "-1.5px",
                  color: "#17233c",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: "#1769e0",
                  }}
                >
                  QA
                </Box>
                Book
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                QA Management Workspace
              </Typography>
            </Box>

            {success ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 3,
                }}
              >

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#15213a",
                  }}
                >
                  Password reset successfully
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    lineHeight: 1.6,
                  }}
                >
                  Your QABook password has been
                  updated. You can now sign in
                  with your new password.
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleBackToLogin}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 4,
                    minHeight: 54,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #1267df 0%, #1677ee 100%)",
                  }}
                >
                  Back to sign in
                </Button>
              </Box>
            ) : (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#15213a",
                  }}
                >
                  Create a new password
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                    mb: 3,
                  }}
                >
                  Enter a new password for your
                  QABook account.
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 1.5,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  label="New password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword(
                                (value) =>
                                  !value,
                              )
                            }
                            edge="end"
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPassword ? (
                              <VisibilityOffOutlinedIcon />
                            ) : (
                              <VisibilityOutlinedIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                  }}
                />

                <TextField
                  label="Confirm new password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  fullWidth
                  margin="normal"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleResetPassword();
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(
                                (value) =>
                                  !value,
                              )
                            }
                            edge="end"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <VisibilityOffOutlinedIcon />
                            ) : (
                              <VisibilityOutlinedIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                  }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleResetPassword}
                  disabled={
                    loading || !token
                  }
                  endIcon={
                    !loading ? (
                      <ArrowForwardIcon />
                    ) : undefined
                  }
                  sx={{
                    mt: 3,
                    minHeight: 54,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #1267df 0%, #1677ee 100%)",
                  }}
                >
                  {loading
                    ? "Resetting password..."
                    : "Reset password"}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={handleBackToLogin}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                  }}
                >
                  Back to sign in
                </Button>
              </>
            )}
          </Paper>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="caption">
            © 2026 QABook. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}