import { useEffect, useState } from "react";

import {
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import { reportService } from "../../services/reportService";

import type { ReportSummary } from "../../types/report";
import RequirementCoverageTable from "../../components/reports/RequirementCoverageTable";
import TraceabilityTable from "../../components/reports/TraceabilityTable";

import type {
  TraceabilityItem,
} from "../../types/report";

import type {
  RequirementCoverage,
} from "../../types/report";

export default function ReportsPage() {
  const [summary, setSummary] =
    useState<ReportSummary | null>(
      null,
    );

  const [coverage, setCoverage] =
    useState<RequirementCoverage[]>(
    [],
  );

  const [traceability, setTraceability] =
  useState<TraceabilityItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);

        const [
            summaryData,
            coverageData,
            traceabilityData,
          ] = await Promise.all([
            reportService.getSummary(),
            reportService.getRequirementCoverage(),
            reportService.getTraceability(),
          ]);

          setSummary(summaryData);

          setCoverage(
            coverageData.coverage,
          );

          setTraceability(
            traceabilityData.traceability,
          );

          setSummary(summaryData);

          setCoverage(
            coverageData.coverage,
          );

        setError("");
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load reports.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
      >
        Reports
      </Typography>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
            >
              Execution Summary
            </Typography>

            <Typography>
              Total Executions:{" "}
              {
                summary
                  ?.execution_summary
                  .total
              }
            </Typography>

            <Typography>
              Passed:{" "}
              {
                summary
                  ?.execution_summary
                  .passed
              }
            </Typography>

            <Typography>
              Failed:{" "}
              {
                summary
                  ?.execution_summary
                  .failed
              }
            </Typography>

            <Typography>
              Blocked:{" "}
              {
                summary
                  ?.execution_summary
                  .blocked
              }
            </Typography>

            <Typography>
              Not Executed:{" "}
              {
                summary
                  ?.execution_summary
                  .not_executed
              }
            </Typography>

            <Typography
              sx={{
                 mt: 2,
                 fontWeight: 600,
                }}
              >
                Pass Rate:{" "}
                {summary?.execution_summary.pass_percentage}%
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
            >
              Bug Summary
            </Typography>

            <Typography>
              Total Bugs:{" "}
              {
                summary
                  ?.bug_summary.total
              }
            </Typography>

            <Typography>
              Open:{" "}
              {
                summary
                  ?.bug_summary.open
              }
            </Typography>

            <Typography>
              In Progress:{" "}
              {
                summary
                  ?.bug_summary
                  .in_progress
              }
            </Typography>

            <Typography>
              Fixed:{" "}
              {
                summary
                  ?.bug_summary.fixed
              }
            </Typography>

            <Typography>
              Closed:{" "}
              {
                summary
                  ?.bug_summary.closed
              }

              <Typography>
                Reopened:{" "}
                {
                  summary
                    ?.bug_summary
                    .reopened
                }
              </Typography>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
          <RequirementCoverageTable
            coverage={coverage}
          />

          <TraceabilityTable
          traceability={traceability}
        />
    </>
  );
}