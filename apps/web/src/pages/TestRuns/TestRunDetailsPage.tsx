import {
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";
import { getTestRunStatusColor } from "../../utils/testRunStatus";

import { testRunService } from "../../services/testRunService";
import { testExecutionService } from "../../services/testExecutionService";

import type { TestRun } from "../../types/testRun";
import type {
  TestExecution,
  TestExecutionSummary,
} from "../../types/testExecution";

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
}

function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography variant="h5">
        {value}
      </Typography>
    </Paper>
  );
}


export default function TestRunDetailsPage() {
  const { id } = useParams();
  const [testRun, setTestRun] =
    useState<TestRun | null>(null);

  const [summary, setSummary] =
    useState<TestExecutionSummary | null>(
      null,
    );

  const [executions, setExecutions] =
  useState<TestExecution[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadTestRun() {
    if (!id) {
      return;
    }

    try {
      setLoading(true);

      const [
        runData,
        summaryData,
        executionData,
      ] = await Promise.all([
        testRunService.getTestRun(
        Number(id),
      ),
      testExecutionService.getExecutionSummary(
        Number(id),
      ),
      testExecutionService.getRunExecutions(
        Number(id),
      ),
    ]);

    setTestRun(runData);
    setSummary(summaryData);
    setExecutions(executionData);
  } finally {
    setLoading(false);
  }
}

  loadTestRun();
}, [id]);

  if (loading) {
  return <CircularProgress />;
}

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
      >
        Test Run Details
      </Typography>

      <Paper
  elevation={2}
  sx={{
    p: 3,
    mt: 2,
  }}
>
  <Typography
    variant="h6"
    gutterBottom
  >
    Run Information
  </Typography>

  <Divider sx={{ mb: 2 }} />

  <Grid
  container
  spacing={2}
  sx={{
    mb: 2,
  }}
>
  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Run Code:</strong>{" "}
      {testRun?.run_code}
    </Typography>
  </Grid>

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Run Name:</strong>{" "}
      {testRun?.name}
    </Typography>
  </Grid>

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Suite:</strong>{" "}
      {testRun?.suite.suite_code} -{" "}
      {testRun?.suite.name}
    </Typography>
  </Grid>

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography
  component="div"
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,
  }}
>
  <strong>Status:</strong>

  <Chip
    label={testRun?.status ?? "-"}
    color={getTestRunStatusColor(
      testRun?.status ?? "",
    )}
    size="small"
  />
</Typography>
  </Grid>
</Grid>

    <Typography
      variant="h6"
      gutterBottom
    >
      Execution Information
    </Typography>

    <Divider sx={{ mb: 2 }} />

    <Grid
  container
  spacing={2}
>
  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Build Version:</strong>{" "}
      {testRun?.build_version ?? "-"}
    </Typography>
  </Grid>

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Environment:</strong>{" "}
      {testRun?.environment ?? "-"}
    </Typography>
  </Grid>

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Tester:</strong>{" "}
      {testRun?.tester ?? "-"}
    </Typography>
  </Grid>
  

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>Start Date:</strong>{" "}
      
       {formatDate(testRun?.start_date ?? null)}
    </Typography>
  </Grid>

  <Grid size={{ xs: 12, md: 6 }}>
    <Typography>
      <strong>End Date:</strong>{" "}
      {formatDate(testRun?.end_date ?? null)}
    </Typography>
  </Grid>
</Grid>
    </Paper>

    <Paper
  elevation={2}
  sx={{
    p: 3,
    mt: 3,
  }}
>
  <Typography
    variant="h6"
    gutterBottom
  >
    Execution Summary
  </Typography>

  <Divider sx={{ mb: 2 }} />

  <Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <SummaryCard
    title="Total Test Cases"
    value={summary?.total ?? 0}
  />
</Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <SummaryCard
    title="Passed"
    value={summary?.passed ?? 0}
  />
</Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <SummaryCard
    title="Failed"
    value={summary?.failed ?? 0}
  />
</Grid>

<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <SummaryCard
    title="Blocked"
    value={summary?.blocked ?? 0}
  />
</Grid>

<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <SummaryCard
    title="Not Executed"
    value={summary?.not_executed ?? 0}
  />
</Grid>

<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <SummaryCard
    title="Pass Percentage"
    value={`${summary?.pass_percentage ?? 0}%`}
  />
</Grid>
</Grid>
</Paper>
<Paper
  elevation={2}
  sx={{
    p: 3,
    mt: 3,
  }}
>
  <Typography
    variant="h6"
    gutterBottom
  >
    Execution History
  </Typography>

  <Divider sx={{ mb: 2 }} />

  <TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Test Case</TableCell>
        <TableCell>Title</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Executed By</TableCell>
        <TableCell>Executed At</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {executions.map((execution) => (
        <TableRow key={execution.id}>
          <TableCell>
            {execution.test_case.test_case_code}
          </TableCell>

          <TableCell>
            {execution.test_case.title}
          </TableCell>

          <TableCell>
           <Chip
              label={execution.status}
              color={getTestRunStatusColor(
                execution.status,
              )}
              size="small"
            />
          </TableCell>

          <TableCell>
            {execution.executed_by ?? "-"}
          </TableCell>

          <TableCell>
            {formatDate(
              execution.executed_at,
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
</Paper>

    </>
  );
}