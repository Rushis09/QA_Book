import {
  Box,
  Button,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
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
        }}
      >
        <Container maxWidth="md">
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
              }}
            >
              QABook
            </Typography>

            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              size="small"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="md">
        <Box
          sx={{
            py: {
              xs: 5,
              md: 8,
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Privacy Policy
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 4,
            }}
          >
            Last updated: 2026
          </Typography>

          {/* Section 1 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              1. Overview
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook is an AI-powered QA workspace for managing software
              testing activities. This Privacy Policy describes how
              information is handled when you use the QABook platform.
            </Typography>
          </Box>

          {/* Section 2 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              2. Information You Provide
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook may process information that you provide while using
              the platform, including account information, project data,
              requirements, test cases, test execution information, defect
              information, and files or testing evidence that you upload.
            </Typography>
          </Box>

          {/* Section 3 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              3. Authentication Information
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              Account credentials and authentication-related information
              are processed to provide secure access to the platform.
              Passwords should never be shared with other users.
            </Typography>
          </Box>

          {/* Section 4 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              4. Project and QA Data
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              Information created within QABook may be stored and processed
              so that the platform can provide project management,
              requirements management, test management, execution,
              reporting, and related QA functionality.
            </Typography>
          </Box>

          {/* Section 5 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              5. AI-Assisted Features
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook provides AI-assisted workflows for selected QA
              activities. Information submitted to these workflows may be
              processed by the configured AI service to generate requested
              QA artifacts. Users should avoid submitting information that
              they are not authorized to process through such services.
            </Typography>
          </Box>

          {/* Section 6 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              6. Uploaded Files and Evidence
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              Files uploaded to supported QABook workflows may be stored
              using the platform's configured object-storage infrastructure
              so that they can be accessed as part of the corresponding
              QA workflow.
            </Typography>
          </Box>

          {/* Section 7 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              7. Third-Party Integrations
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook can integrate with external services such as GitHub
              and configured AI services. Information exchanged with these
              services is subject to the applicable service's own terms
              and privacy policies.
            </Typography>
          </Box>

          {/* Section 8 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              8. Data Security
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook uses application-level authentication and access
              controls intended to protect platform data. No online system
              can guarantee absolute security, so users should also follow
              appropriate security practices when using the platform.
            </Typography>
          </Box>

          {/* Section 9 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              9. Contact
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              For privacy-related questions concerning QABook, contact:
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontWeight: 600,
              }}
            >
              qabook.qa@gmail.com
            </Typography>
          </Box>

          <Divider sx={{ my: 5 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.7,
            }}
          >
            This page describes the current intended handling of information
            within QABook and should be updated if the platform's data
            processing practices change.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}