import {
  Box,
  Button,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
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
            Terms and Conditions
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 4,
            }}
          >
            Last updated: 2026
          </Typography>

          {/* 1 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              1. Acceptance of Terms
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              By accessing or using QABook, you agree to use the platform
              in accordance with these Terms and Conditions. If you do not
              agree with these terms, you should not use the platform.
            </Typography>
          </Box>

          {/* 2 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              2. Use of the Platform
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook provides tools for software quality assurance,
              requirements management, test management, testing workflows,
              automation, reporting, and related activities. You are
              responsible for using the platform only for lawful and
              authorized purposes.
            </Typography>
          </Box>

          {/* 3 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              3. Account Responsibilities
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              You are responsible for maintaining the confidentiality of
              your account credentials and for activity performed through
              your account. You should use appropriate security practices
              and notify the platform administrator if you believe your
              account has been compromised.
            </Typography>
          </Box>

          {/* 4 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              4. Project and Testing Data
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              You are responsible for the requirements, test cases,
              scenarios, execution results, defects, files, evidence, and
              other information that you create or upload to QABook. You
              should ensure that you have the necessary rights and
              authorization to use such information.
            </Typography>
          </Box>

          {/* 5 */}
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
              QABook may provide AI-assisted functionality for generating
              or transforming QA-related information. AI-generated output
              should be reviewed by the user before being relied upon for
              testing, development, business, or other decisions.
            </Typography>
          </Box>

          {/* 6 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              6. Automation and External Services
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook may integrate with external services such as GitHub,
              GitHub Actions, AI services, and object-storage services.
              Your use of those services may also be subject to their
              respective terms, policies, and technical limitations.
            </Typography>
          </Box>

          {/* 7 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              7. Testing Results and Decisions
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook provides tools for organizing and reporting testing
              information. Users remain responsible for reviewing test
              results, automation results, AI-generated content, and other
              outputs before making software release or quality decisions.
            </Typography>
          </Box>

          {/* 8 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              8. Prohibited Use
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              You must not use QABook to access systems or information
              without authorization, interfere with the operation of the
              platform, attempt to bypass access controls, or use the
              platform for unlawful activities.
            </Typography>
          </Box>

          {/* 9 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              9. Availability and Changes
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              QABook may be updated, modified, or temporarily unavailable
              from time to time. Features, integrations, and workflows may
              change as the platform evolves.
            </Typography>
          </Box>

          {/* 10 */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              10. Contact
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
              }}
            >
              For questions regarding these Terms and Conditions, contact:
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
            These terms describe the current intended use of QABook and
            should be reviewed and updated if the platform's services,
            integrations, or operating practices change.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}