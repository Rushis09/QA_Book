import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import { dashboardService } from "../../services/dashboardService";

import type { DashboardSummary } from "../../types/dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ViewListIcon from "@mui/icons-material/ViewList";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BugReportIcon from "@mui/icons-material/BugReport";
import PieChartIcon from "@mui/icons-material/PieChart";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
}


function DashboardCard({
  title,
  value,
  icon,
}: DashboardCardProps) {
  
return (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      minHeight: 120,
      transition:
        "all 0.2s ease",
      "&:hover": {
        boxShadow: 3,
        transform:
          "translateY(-2px)",
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 2,
      }}
    >
      {icon}

      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>
    </Box>

    <Typography
      variant="h3"
      sx={{
        fontWeight: 700,
      }}
    >
      {value}
    </Typography>
  </Paper>
);
}

  export default function DashboardPage() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const data =
          await dashboardService.getSummary();

        setSummary(data);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
      >
        Dashboard
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          QA Overview
        </Typography>

        <Grid
  container
  spacing={2}
>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DashboardCard
      title="Projects"
      value={summary?.projects ?? 0}
      icon={<FolderIcon color="primary" />}
    />
  </Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DashboardCard
      title="Requirements"
      value={summary?.requirements ?? 0}
       icon={<DescriptionIcon color="primary" />}
    />
  </Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <DashboardCard
    title="Test Scenarios"
    value={summary?.test_scenarios ?? 0}
    icon={<FactCheckIcon color="primary" />}
  />
</Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DashboardCard
      title="Test Cases"
      value={summary?.test_cases ?? 0}
      icon={<ChecklistIcon color="primary" />}
    />
  </Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DashboardCard
      title="Test Suites"
      value={summary?.test_suites ?? 0}
      icon={<ViewListIcon color="primary" />}
    />
  </Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DashboardCard
      title="Test Runs"
      value={summary?.test_runs ?? 0}
      icon={<PlayArrowIcon color="primary" />}
    />
  </Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <DashboardCard
      title="Test Executions"
      value={summary?.test_executions ?? 0}
      icon={<TaskAltIcon color="primary" />}
    />
  </Grid>

  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
  <DashboardCard
    title="Bug Reports"
    value={summary?.bugs ?? 0}
    icon={<BugReportIcon color="primary" />}
  />
</Grid>

  <Grid size={{ xs: 12 }}>
    <DashboardCard
      title="Overall Pass Rate"
      value={`${summary?.overall_pass_rate ?? 0}%`}
      icon={<PieChartIcon color="primary" />}
    />
  </Grid>
</Grid>
      </Paper>
    </>
  );
}