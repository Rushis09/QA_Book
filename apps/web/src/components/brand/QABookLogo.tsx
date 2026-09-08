import { Box, Typography } from "@mui/material";

interface QABookLogoProps {
  size?: "sm" | "md" | "lg";
  dark?: boolean;
  showTagline?: boolean;
  compact?: boolean;
}

const sizes = {
  sm: {
    icon: 30,
    wordmark: "1.15rem",
    tagline: "0.58rem",
    gap: 0.8,
  },
  md: {
    icon: 40,
    wordmark: "1.45rem",
    tagline: "0.64rem",
    gap: 1,
  },
  lg: {
    icon: 56,
    wordmark: "2rem",
    tagline: "0.72rem",
    gap: 1.2,
  },
};

export default function QABookLogo({
  size = "md",
  dark = false,
  showTagline = false,
  compact = false,
}: QABookLogoProps) {
  const config = sizes[size];

  const gradientId = `qabook-logo-gradient-${size}`;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: config.gap,
        userSelect: "none",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        sx={{
          width: config.icon,
          height: config.icon,
          flexShrink: 0,
          display: "block",
        }}
        aria-label="QABook logo"
        role="img"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="12"
            y1="12"
            x2="88"
            y2="88"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#19C6FF" />
            <stop offset="48%" stopColor="#1677FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>

        {/* Q shape */}
        <circle
          cx="43"
          cy="43"
          r="29"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="14"
        />

        {/* Q tail */}
        <path
          d="M58 61 L78 81"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Inner check */}
        <path
          d="M29 43 L39 53 L57 34"
          fill="none"
          stroke={dark ? "#FFFFFF" : "#FFFFFF"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>

      {!compact && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: config.wordmark,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: dark ? "#FFFFFF" : "#0B1530",
            }}
          >
            <Box
              component="span"
              sx={{
                color: "#1677FF",
              }}
            >
              QA
            </Box>
            <Box
              component="span"
              sx={{
                color: dark ? "#FFFFFF" : "#17213A",
              }}
            >
              Book
            </Box>
          </Typography>

          {showTagline && (
            <Typography
              component="span"
              sx={{
                mt: 0.55,
                fontSize: config.tagline,
                fontWeight: 600,
                letterSpacing: "0.08em",
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: dark
                  ? "rgba(255,255,255,0.72)"
                  : "rgba(23,33,58,0.58)",
              }}
            >
              TEST SMARTER. DELIVER BETTER.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}