import {
  useState,
  type ReactNode,
} from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import QABookLogo from "../brand/QABookLogo";
import api from "../../services/api";
import { login } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

type AuthView = "login" | "forgot-password" | "register";

export default function LoginPage() {
  const [view, setView] = useState<AuthView>("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const { login: authLogin } =
    useAuth();

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const switchView = (nextView: AuthView) => {
    clearMessages();

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setView(nextView);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError(
        "Username and password are required.",
      );
      return;
    }
  
    try {
      setLoading(true);
      clearMessages();
    
      const response = await login({
        username: username.trim(),
        password,
      });
    
      void rememberMe;
    
      await authLogin(
        response.access_token,
      );
    } catch (loginError: any) {
      console.error(
        "QABook login error:",
        loginError,
      );
    
      const status =
        loginError?.response?.status;
    
      const detail =
        loginError?.response?.data?.detail;
    
      if (status === 401) {
        setError(
          detail ||
            "Invalid username or password.",
        );
      } else if (status === 403) {
        setError(
          detail ||
            "Your account is inactive.",
        );
      } else if (!loginError?.response) {
        setError(
          "Unable to connect to QABook. Please check that the backend is running.",
        );
      } else {
        setError(
          detail ||
            "Unable to sign in. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await api.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
        },
      );

      setSuccessMessage(
        response.data?.message ||
          "If an account exists for this email, password reset instructions have been sent.",
      );
    } catch (forgotError) {
      console.error(forgotError);

      setError(
        "Unable to process the password reset request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "All fields are required.",
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
      clearMessages();

      const response = await api.post(
        "/auth/register",
        {
          username: username.trim(),
          email: email.trim(),
          password,
        },
      );

      setSuccessMessage(
        response.data?.message ||
          "Account created successfully. You can now sign in.",
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setView("login");
        setEmail("");
        setSuccessMessage(
          "Account created successfully. Please sign in.",
        );
      }, 1200);
    } catch (registerError: any) {
      console.error(registerError);

      const status =
        registerError?.response?.status;

      const detail =
        registerError?.response?.data?.detail;

      if (status === 409) {
        setError(
          detail ||
            "Username or email already exists.",
        );
      } else if (status === 422) {
        setError(
          "Please check the information you entered.",
        );
      } else {
        setError(
          "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (view === "register") {
      return "Create your account";
    }

    if (view === "forgot-password") {
      return "Reset your password";
    }

    return "Welcome back";
  };

  const getSubtitle = () => {
    if (view === "register") {
      return "Create your QABook account to get started";
    }

    if (view === "forgot-password") {
      return "Enter your email and we'll send you a reset link";
    }

    return "Sign in to your account to continue";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f7f9fc",
      }}
    >
      {/* LEFT PRODUCT PANEL */}

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
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.05)",
            right: -100,
            bottom: 80,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <QABookLogo
            size="md"
            dark
            showTagline
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: 2,
            mt: 1,
            opacity: 0.85,
          }}
        >
          {[
            "Plan",
            "Design",
            "Test",
            "Deliver",
          ].map((item, index) => (
            <Box
              key={item}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.75rem",
                }}
              >
                {item}
              </Typography>

              {index < 3 && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.6,
                  }}
                >
                  •
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 540,
            mt: {
              md: 7,
              lg: 9,
            },
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
            Your AI-Powered
            <br />
            Manual Testing
            <br />
            Workspace
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
            Turn requirements into test
            cases, organize your QA
            process, and deliver better
            software — faster.
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: 5,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxWidth: 520,
          }}
        >
          <FeatureItem
            icon={<DescriptionOutlinedIcon />}
            title="AI Assistance"
            description="Generate requirements, scenarios and test cases with AI"
            iconBackground="#d9f4ff"
            iconColor="#1677c8"
          />

          <FeatureItem
            icon={<LayersOutlinedIcon />}
            title="End-to-End QA Management"
            description="Manage projects, test cases, executions and reports in one place"
            iconBackground="#a78bfa"
            iconColor="#ffffff"
          />

          <FeatureItem
            icon={<BarChartOutlinedIcon />}
            title="Better Collaboration"
            description="Keep your team aligned and ship high quality software"
            iconBackground="#42d9a0"
            iconColor="#ffffff"
          />

          <FeatureItem
            icon={<BoltOutlinedIcon />}
            title="Save Time"
            description="Focus on what matters with AI-powered productivity"
            iconBackground="#ffc04d"
            iconColor="#ffffff"
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: "auto",
            maxWidth: 520,
            p: 2.5,
            borderRadius: 2,
            border:
              "1px solid rgba(255,255,255,0.18)",
            background:
              "rgba(255,255,255,0.08)",
          }}
        >
          <Typography
            sx={{
              fontSize: "2rem",
              lineHeight: 0.8,
              opacity: 0.65,
            }}
          >
            “
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              lineHeight: 1.6,
              mt: 0.5,
            }}
          >
            QABook helps our team stay
            organized and ship with
            confidence.
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              opacity: 0.75,
            }}
          >
            — QA Professional
          </Typography>
        </Box>
      </Box>

      {/* RIGHT AUTH PANEL */}

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
        {/* Top helper */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Need help?
          </Typography>

          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              px: 2,
              py: 1,
            }}
          >
            View Documentation
            <ArrowForwardIcon
              sx={{
                ml: 1,
                fontSize: 16,
              }}
            />
          </Button>
        </Box>

        {/* Auth area */}

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
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
                display: "flex",
                justifyContent: "center",
                mb: 4,
              }}
            >
              <QABookLogo
                size="lg"
                showTagline
              />
            </Box>

            {/* Heading */}

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#15213a",
                }}
              >
                {getTitle()}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.7,
                }}
              >
                {getSubtitle()}
              </Typography>
            </Box>

            {/* Messages */}

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

            {successMessage && (
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                  borderRadius: 1.5,
                }}
              >
                {successMessage}
              </Alert>
            )}

            {/* LOGIN */}

            {view === "login" && (
              <>
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value,
                    )
                  }
                  autoComplete="username"
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleOutlinedIcon
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          />
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
                  label="Password"
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
                  autoComplete="current-password"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleLogin();
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

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    mt: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(
                            event.target.checked,
                          )
                        }
                        size="small"
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                      >
                        Remember me
                      </Typography>
                    }
                  />

                  <Button
                    variant="text"
                    size="small"
                    onClick={() =>
                      switchView(
                        "forgot-password",
                      )
                    }
                    sx={{
                      textTransform:
                        "none",
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleLogin}
                  disabled={loading}
                  endIcon={
                    !loading ? (
                      <ArrowForwardIcon />
                    ) : undefined
                  }
                  sx={{
                    mt: 2,
                    minHeight: 54,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #1267df 0%, #1677ee 100%)",
                    boxShadow:
                      "0 8px 20px rgba(18, 103, 223, 0.22)",
                  }}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    my: 3,
                  }}
                >
                  <Divider sx={{ flex: 1 }} />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    or
                  </Typography>

                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Create account */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, #f4efff 0%, #faf7ff 100%)",
                    border:
                      "1px solid #ebe2ff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "#e9ddff",
                        color: "#7445d8",
                      }}
                    >
                      <PersonAddOutlinedIcon />
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        New to QABook?
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Create an account
                        and start managing
                        your QA workflow.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      switchView(
                        "register",
                      )
                    }
                    sx={{
                      flexShrink: 0,
                      textTransform:
                        "none",
                      borderRadius: 1.5,
                      borderColor:
                        "#b794ff",
                      color: "#7041d5",
                    }}
                  >
                    Create account
                  </Button>
                </Box>
              </>
            )}

            {/* FORGOT PASSWORD */}

            {view === "forgot-password" && (
              <>
                <TextField
                  label="Email address"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  autoComplete="email"
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleForgotPassword();
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          />
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
                  onClick={
                    handleForgotPassword
                  }
                  disabled={loading}
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
                    ? "Sending..."
                    : "Send reset link"}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() =>
                    switchView("login")
                  }
                  sx={{
                    mt: 1,
                    textTransform: "none",
                  }}
                >
                  Back to sign in
                </Button>
              </>
            )}

            {/* REGISTER */}

            {view === "register" && (
              <>
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value,
                    )
                  }
                  autoComplete="username"
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleOutlinedIcon
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          />
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
                  label="Email address"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  autoComplete="email"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          />
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
                  label="Password"
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
                  label="Confirm password"
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
                      handleRegister();
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
                  onClick={handleRegister}
                  disabled={loading}
                  endIcon={
                    !loading ? (
                      <PersonAddOutlinedIcon />
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
                    ? "Creating account..."
                    : "Create account"}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() =>
                    switchView("login")
                  }
                  sx={{
                    mt: 1,
                    textTransform: "none",
                  }}
                >
                  Already have an account? Sign in
                </Button>
              </>
            )}
          </Paper>
        </Box>

        {/* Footer */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            px: 1,
            color: "text.secondary",
          }}
        >
          <Typography variant="caption">
            © 2026 QABook. All rights
            reserved.
          </Typography>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              gap: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{ cursor: "pointer" }}
            >
              Privacy
            </Typography>

            <Typography
              variant="caption"
              sx={{ cursor: "pointer" }}
            >
              Terms
            </Typography>

            <Typography
              variant="caption"
              sx={{ cursor: "pointer" }}
            >
              Contact
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBackground: string;
  iconColor: string;
}

function FeatureItem({
  icon,
  title,
  description,
  iconBackground,
  iconColor,
}: FeatureItemProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            iconBackground,
          color: iconColor,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.2,
            color:
              "rgba(255,255,255,0.78)",
            lineHeight: 1.45,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}