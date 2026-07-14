import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Grid, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import AssignmentHeader from "../../components/testSuites/assignment/AssignmentHeader";
import AvailableTestCasesTable from "../../components/testSuites/assignment/AvailableTestCasesTable";
import AssignedTestCasesTable from "../../components/testSuites/assignment/AssignedTestCasesTable";

import { testSuiteService } from "../../services/testSuiteService";
import { testCaseService } from "../../services/testCaseService";

import type { TestCase } from "../../types/testCase";
import type { TestSuite } from "../../types/testSuite";

export default function AssignTestCasesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suite, setSuite] = useState<TestSuite | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError("Invalid Test Suite.");
        setLoading(false);
        return;
      }

      try {
        const [suiteData, testCaseData] = await Promise.all([
          testSuiteService.getTestSuite(Number(id)),
          testCaseService.getTestCases(),
        ]);

        setSuite(suiteData);
        setTestCases(testCaseData);
        setSelectedIds(
          suiteData.test_cases.map((testCase) => testCase.id),
        );
      } catch {
        setError("Failed to load assignment data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleToggle(testCaseId: number) {
    setSelectedIds((previous) =>
      previous.includes(testCaseId)
        ? previous.filter((id) => id !== testCaseId)
        : [...previous, testCaseId],
    );
  }

  async function handleSave() {
    if (!suite) {
      return;
    }

    try {
      setSaving(true);

      await testSuiteService.assignTestCases(
        suite.id,
        selectedIds,
      );

      navigate("/test-suites");
    } catch {
      setError("Failed to save assignments.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!suite) {
    return (
      <Alert severity="error">
        Test Suite not found.
      </Alert>
    );
  }

  return (
    <>
      <AssignmentHeader
        suite={suite}
        assignedCount={selectedIds.length}
        saving={saving}
        onSave={handleSave}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AvailableTestCasesTable
            testCases={testCases}
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AssignedTestCasesTable
            testCases={testCases}
            selectedIds={selectedIds}
          />
        </Grid>
      </Grid>

      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate("/test-suites")}
          disabled={saving}
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
}