import {
  ArrowBack,
  AutoAwesome,
  BugReport,
  CheckCircleOutline,
  Cloud,
  Code,
  Dashboard,
  GitHub,
  Insights,
  PlayCircleOutline,
  Security,
  Speed,
  Storage,
  UploadFile,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Dashboard,
    title: "QA Management",
    description:
      "Manage projects, requirements, test scenarios, test cases, test suites, test runs, executions, and defects in one workspace.",
  },
  {
    icon: AutoAwesome,
    title: "AI-Assisted Testing",
    description:
      "Use AI-assisted workflows to generate requirements, scenarios, and test cases from project documentation and QA inputs.",
  },
  {
    icon: Speed,
    title: "Testing Studio",
    description:
      "Organize testing across Functional, API, Database, Automation, Performance, Security, and Accessibility activities.",
  },
  {
    icon: Code,
    title: "Test Automation",
    description:
      "Create automation projects, map test cases, generate automation frameworks, and work with Playwright and pytest.",
  },
  {
    icon: GitHub,
    title: "GitHub & CI/CD",
    description:
      "Connect repositories, work with GitHub Actions, execute automation through CI workflows, and synchronize execution results.",
  },
  {
    icon: Insights,
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1.5 }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ letterSpacing: "-0.02em" }}
            >
              QABook
            </Typography>

            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/login")}
              variant="outlined"
              size="small"
            >
              Back to Login
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 7, md: 10 },
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
            fontWeight={800}
            sx={{
              fontSize: { xs: "2.4rem", md: "4rem" },
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
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
              startIcon={<GitHub />}
            >
              View on GitHub
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* What is QABook */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            What is QABook?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 900, lineHeight: 1.8 }}
          >
            QABook is an AI-powered QA workspace designed to bring
            requirements, test design, execution, defects, automation,
            CI/CD, and reporting into a connected software testing
            workflow.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 900, lineHeight: 1.8, mt: 2 }}
          >
            The platform connects the QA lifecycle so teams can move from
            requirements and test planning through execution, defect
            management, retesting, automation, and reporting without
            maintaining separate disconnected workflows.
          </Typography>
        </Box>

        {/* Features */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Platform Features
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Grid key={feature.title} size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Icon color="primary" sx={{ fontSize: 36, mb: 1 }} />

                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {feature.title}
                      </Typography>

                      <Typography color="text.secondary" lineHeight={1.7}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* QA Lifecycle */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            QA Lifecycle
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            QABook organizes the major QA activities into a connected
            lifecycle.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
            >
              {lifecycle.map((item, index) => (
                <Box key={item}>
                  <Chip
                    label={item}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />

                  {index < lifecycle.length - 1 && (
                    <Typography
                      component="span"
                      color="text.secondary"
                      sx={{
                        display: { xs: "none", md: "inline" },
                        mx: 1,
                      }}
                    >
                      →
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Testing Studio */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Testing Studio
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 850 }}>
            Testing Studio provides a structured workspace for different
            testing disciplines and execution methods.
          </Typography>

          <Grid container spacing={2}>
            {[
              "Functional Testing",
              "API Testing",
              "Database Testing",
              "Automation Testing",
              "Performance Testing",
              "Security Testing",
              "Accessibility Testing",
            ].map((item) => (
              <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CheckCircleOutline color="primary" />
                    <Typography fontWeight={600}>{item}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* AI */}
        <Box sx={{ pb: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <AutoAwesome
                color="primary"
                sx={{ fontSize: 48, flexShrink: 0 }}
              />

              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  AI-Assisted QA
                </Typography>

                <Typography color="text.secondary" lineHeight={1.8}>
                  QABook includes AI-assisted workflows that can help
                  transform project documentation and QA inputs into
                  structured testing artifacts such as requirements,
                  test scenarios, and test cases.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Automation */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Automation & CI/CD
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Code color="primary" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Automation Projects
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    Create automation projects and map QA test cases to
                    automation workflows.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <GitHub color="primary" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    GitHub Integration
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    Connect repositories and integrate automation workflows
                    with GitHub.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Cloud color="primary" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    CI Execution
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    Work with GitHub Actions and synchronize automation
                    execution results with QABook.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Screenshots / Demo */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Product Walkthrough
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Screenshots and a product demonstration can be added here to
            showcase the QABook workflow.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <PlayCircleOutline
                    color="primary"
                    sx={{ fontSize: 56 }}
                  />
                  <Typography fontWeight={700}>
                    Product Demo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demo video can be embedded here.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <Dashboard color="primary" sx={{ fontSize: 56 }} />
                  <Typography fontWeight={700}>
                    Product Screenshots
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    QABook screenshots can be added here.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Architecture */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Architecture
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Stack spacing={2}>
              <Typography fontWeight={700}>
                Frontend — React + TypeScript + Material UI
              </Typography>

              <Typography color="text.secondary">
                The web application provides the QABook user interface,
                authentication flow, QA workspace, testing studio,
                automation workflows, and reporting views.
              </Typography>

              <Divider />

              <Typography fontWeight={700}>
                Backend — FastAPI + Python
              </Typography>

              <Typography color="text.secondary">
                The backend provides authentication, project and QA
                management APIs, AI workflows, automation integration,
                GitHub integration, reporting, and supporting services.
              </Typography>

              <Divider />

              <Typography fontWeight={700}>
                Data & Infrastructure
              </Typography>

              <Typography color="text.secondary">
                QABook uses PostgreSQL-compatible database infrastructure,
                object storage for uploaded artifacts, AI services, and
                GitHub-based automation workflows.
              </Typography>
            </Stack>
          </Paper>
        </Box>

        {/* Getting Started */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Getting Started
          </Typography>

          <Stack spacing={2}>
            {[
              "Create an account or sign in to QABook.",
              "Create or open a project.",
              "Add requirements and testing artifacts.",
              "Create scenarios, test cases, suites, and test runs.",
              "Execute tests and record results.",
              "Track bugs and perform retesting.",
              "Use automation and CI/CD integrations when required.",
              "Review project results through reports and analytics.",
            ].map((step, index) => (
              <Paper
                key={step}
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={index + 1}
                    color="primary"
                    sx={{ minWidth: 40 }}
                  />
                  <Typography>{step}</Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Resources */}
        <Box sx={{ pb: 10 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Resources
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <GitHub color="primary" sx={{ fontSize: 36, mb: 1 }} />

                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Source Code
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 2 }}>
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
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <UploadFile
                    color="primary"
                    sx={{ fontSize: 36, mb: 1 }}
                  />

                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    BRD & AI Workflows
                  </Typography>

                  <Typography color="text.secondary">
                    Upload supported project documentation and use
                    AI-assisted workflows to create structured QA
                    artifacts.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Storage color="primary" sx={{ fontSize: 36, mb: 1 }} />

                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    QA Evidence
                  </Typography>

                  <Typography color="text.secondary">
                    Organize execution evidence and testing artifacts
                    alongside QA activities.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Divider />

        <Box sx={{ py: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              © 2026 QABook. All rights reserved.
            </Typography>

            <Stack direction="row" spacing={2}>
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
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}