import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloudIcon from "@mui/icons-material/Cloud";
import CodeIcon from "@mui/icons-material/Code";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GitHubIcon from "@mui/icons-material/GitHub";
import InsightsIcon from "@mui/icons-material/Insights";
import StorageIcon from "@mui/icons-material/Storage";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: DashboardIcon,
    title: "QA Management",
    description:
      "Manage projects, requirements, test scenarios, test cases, test suites, test runs, executions, and defects in one workspace.",
  },
  {
    icon: AutoAwesomeIcon,
    title: "AI-Assisted Testing",
    description:
      "Use AI-assisted workflows to generate requirements, scenarios, and test cases from project documentation and QA inputs.",
  },
  {
    icon: BarChartIcon,
    title: "Testing Studio",
    description:
      "Organize testing across Functional, API, Database, Automation, Performance, Security, and Accessibility activities.",
  },
  {
    icon: CodeIcon,
    title: "Test Automation",
    description:
      "Create automation projects, map test cases, generate automation frameworks, and work with Playwright and pytest.",
  },
  {
    icon: GitHubIcon,
    title: "GitHub & CI/CD",
    description:
      "Connect repositories, work with GitHub Actions, execute automation through CI workflows, and synchronize execution results.",
  },
  {
    icon: InsightsIcon,
    title: "Reporting & Analytics",
    description:
      "Track QA execution and project quality through dashboards, reports, analytics, and exportable results.",
  },
];

const lifecycle = [
  "Project",
  "Requirements",
  "Test Scenarios",
  "Test Cases",
  "Test Suites",
  "Test Runs",
  "Execution",
  "Bugs & Retesting",
  "Reports",
];

const testingTypes = [
  "Functional Testing",
  "API Testing",
  "Database Testing",
  "Automation Testing",
  "Performance Testing",
  "Security Testing",
  "Accessibility Testing",
];

const productScreenshots = [
  { title: "Dashboard", src: "/documentation/dashboard.png.png" },
  { title: "Projects", src: "/documentation/projects.png.png" },
  { title: "Project Overview", src: "/documentation/project-overview.png.png" },
  { title: "Requirements", src: "/documentation/requirements.png.png" },
  { title: "Test Scenarios", src: "/documentation/test-scenarios.png.png" },
  { title: "Test Cases", src: "/documentation/test-cases.png.png" },
  { title: "Test Case Editor", src: "/documentation/test-case-editor.png.png" },
  { title: "Test Suites", src: "/documentation/test-suites.png.png" },
  { title: "Test Runs", src: "/documentation/test-runs.png.png" },
  { title: "Test Executions", src: "/documentation/test-executions.png.png" },
  { title: "Bug Reports", src: "/documentation/bug-reports.png.png" },
  { title: "Testing Studio", src: "/documentation/testing-studio.png.png" },
  { title: "Automation", src: "/documentation/automation.png.png" },
  { title: "Reports Overview", src: "/documentation/reports-overview.png.png" },
  { title: "Reports & Defects", src: "/documentation/reports-defects.png.png" },
];

const gettingStarted = [
  "Create an account or sign in to QABook.",
  "Create or open a project.",
  "Add requirements and testing artifacts.",
  "Create scenarios, test cases, suites, and test runs.",
  "Execute tests and record results.",
  "Track bugs and perform retesting.",
  "Use automation and CI/CD integrations when required.",
  "Review project results through reports and analytics.",
];

export default function DocumentationPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f9fc",
        color: "#172033",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              QABook
            </Typography>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/login")}
              variant="outlined"
              size="small"
            >
              Back to Login
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Hero */}
        <Box
          sx={{
            py: {
              xs: 7,
              md: 10,
            },
            textAlign: "center",
          }}
        >
          <Chip
            label="AI Powered QA Workspace"
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: {
                xs: "2.4rem",
                md: "4rem",
              },
              letterSpacing: "-0.04em",
              mb: 2,
            }}
          >
            QABook
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: "auto",
              lineHeight: 1.5,
              mb: 3,
            }}
          >
            A unified workspace for managing software quality,
            AI-assisted testing, test automation, CI/CD, and QA reporting.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
            >
              Open QABook
            </Button>

            <Button
              variant="outlined"
              size="large"
              component="a"
              href="https://github.com/Rushis09/QA_Book"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
            >
              View on GitHub
            </Button>

            <Button
              variant="outlined"
              size="large"
              component="a"
              href="https://qabook-api.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<CodeIcon />}
            >
              API Docs
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* Overview */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            What is QABook?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 900,
              lineHeight: 1.8,
            }}
          >
            QABook is an AI-powered QA workspace designed to bring
            requirements, test design, execution, defects, automation,
            CI/CD, and reporting into a connected software testing
            workflow.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 900,
              lineHeight: 1.8,
              mt: 2,
            }}
          >
            The platform connects the QA lifecycle so teams can move from
            requirements and test planning through execution, defect
            management, retesting, automation, and reporting.
          </Typography>
        </Box>

        {/* Features */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Platform Features
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
              mt: 3,
            }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Paper
                  key={feature.title}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <Icon
                    color="primary"
                    sx={{
                      fontSize: 36,
                      mb: 1,
                    }}
                  />

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* QA Lifecycle */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            QA Lifecycle
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            QABook organizes major QA activities into a connected
            lifecycle.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                md: 4,
              },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {lifecycle.map((item, index) => (
                <Box
                  key={item}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={item}
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                    }}
                  />

                  {index < lifecycle.length - 1 && (
                    <Typography
                      color="text.secondary"
                      sx={{
                        display: {
                          xs: "none",
                          md: "block",
                        },
                      }}
                    >
                      →
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Testing Studio */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Testing Studio
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 850,
            }}
          >
            Testing Studio provides a structured workspace for different
            testing disciplines and execution methods.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {testingTypes.map((item) => (
              <Paper
                key={item}
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <CheckIcon color="primary" />

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* AI */}
        <Box sx={{ pb: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
                gap: 3,
              }}
            >
              <AutoAwesomeIcon
                color="primary"
                sx={{
                  fontSize: 48,
                  flexShrink: 0,
                }}
              />

              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                  }}
                >
                  AI-Assisted QA
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                  }}
                >
                  QABook includes AI-assisted workflows that can help
                  transform project documentation and QA inputs into
                  structured testing artifacts such as requirements,
                  test scenarios, and test cases.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Automation */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Automation & CI/CD
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 3,
              mt: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CodeIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Automation Projects
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                Create automation projects and map QA test cases to
                automation workflows.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <GitHubIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                GitHub Integration
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                Connect repositories and integrate automation workflows
                with GitHub.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CloudIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                CI Execution
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                Work with GitHub Actions and synchronize automation
                execution results with QABook.
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Product Walkthrough */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Product Walkthrough
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 900,
              lineHeight: 1.8,
            }}
          >
            Explore the QABook interface through screenshots from the
            platform. The walkthrough covers the main QA workflow from
            project setup and requirements through test management,
            execution, defects, automation, and reporting.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 3,
            }}
          >
            {productScreenshots.map((screenshot) => (
              <Paper
                key={screenshot.title}
                elevation={0}
                sx={{
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                }}
              >
                <Box
                  component="img"
                  src={screenshot.src}
                  alt={`QABook ${screenshot.title} screen`}
                  loading="lazy"
                  sx={{
                    display: "block",
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    objectPosition: "top",
                    bgcolor: "#f1f5f9",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                />

                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {screenshot.title}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Architecture */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Architecture
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Frontend — React + TypeScript + Material UI
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                The web application provides the QABook user interface,
                authentication flow, QA workspace, Testing Studio,
                automation workflows, and reporting views.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Backend — FastAPI + Python
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                The backend provides authentication, project and QA
                management APIs, AI workflows, automation integration,
                GitHub integration, reporting, and supporting services.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Data & Infrastructure
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                QABook uses PostgreSQL-compatible database infrastructure,
                object storage for uploaded artifacts, AI services, and
                GitHub-based automation workflows.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Getting Started */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Getting Started
          </Typography>

          <Box sx={{ mt: 3 }}>
            {gettingStarted.map((step, index) => (
              <Paper
                key={step}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Chip
                    label={index + 1}
                    color="primary"
                    sx={{
                      minWidth: 40,
                    }}
                  />

                  <Typography>{step}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Resources */}
        <Box sx={{ pb: 10 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Resources
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 3,
              mt: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <GitHubIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Source Code
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Explore the QABook project repository.
              </Typography>

              <Link
                href="https://github.com/Rushis09/QA_Book"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                GitHub Repository
              </Link>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <UploadFileIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                BRD & AI Workflows
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                Upload supported project documentation and use
                AI-assisted workflows to create structured QA artifacts.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <StorageIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                QA Evidence
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                Organize execution evidence and testing artifacts
                alongside QA activities.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CodeIcon
                color="primary"
                sx={{
                  fontSize: 36,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                API Documentation
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  mb: 2,
                }}
              >
                Explore the QABook backend REST API through the interactive
                Swagger documentation.
              </Typography>

              <Link
                href="https://qabook-api.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                Open API Docs
              </Link>
            </Paper>
          </Box>
        </Box>

        {/* Footer */}
        <Divider />

        <Box
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            © 2026 QABook. All rights reserved.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Link
              component="button"
              underline="hover"
              onClick={() => navigate("/privacy")}
            >
              Privacy
            </Link>

            <Link
              component="button"
              underline="hover"
              onClick={() => navigate("/terms")}
            >
              Terms
            </Link>

            <Link
              href="mailto:qabook.qa@gmail.com"
              underline="hover"
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}