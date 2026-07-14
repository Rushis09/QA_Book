import {
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

interface ExecutionHeaderProps {
  runCode: string;
  runName: string;
  suiteName: string;
  tester: string | null;
  environment: string | null;
  buildVersion: string | null;
  status: string;
}

export default function ExecutionHeader({
  runCode,
  runName,
  suiteName,
  tester,
  environment,
  buildVersion,
  status,
}: ExecutionHeaderProps) {
  function getStatusColor() {
    switch (status) {
      case "Completed":
        return "success";

      case "In Progress":
        return "warning";

      case "Not Started":
        return "default";

      default:
        return "primary";
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
        >
          Test Run Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Run Code
            </Typography>

            <Typography>
              {runCode}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Run Name
            </Typography>

            <Typography>
              {runName}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Test Suite
            </Typography>

            <Typography>
              {suiteName}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Tester
            </Typography>

            <Typography>
              {tester || "-"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Environment
            </Typography>

            <Typography>
              {environment || "-"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Build Version
            </Typography>

            <Typography>
              {buildVersion || "-"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Status
            </Typography>

            <Chip
              label={status}
              color={getStatusColor()}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}