import { Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import RequirementsPage from "./pages/Requirements/RequirementsPage";
import TestCasesPage from "./pages/TestCases/TestCasesPage";
import TestScenariosPage from "./pages/TestScenarios/TestScenariosPage";
import TestSuitesPage from "./pages/TestSuites/TestSuitesPage";
import AssignTestCasesPage from "./pages/TestSuites/AssignTestCasesPage";
import TestRunsPage from "./pages/TestRuns/TestRunsPage";
import TestRunDetailsPage from "./pages/TestRuns/TestRunDetailsPage";
import ExecutionPage from "./pages/TestExecutions/ExecutionPage";
import BugsPage from "./pages/Bugs/BugsPage";
import ReportsPage from "./pages/Reports/ReportsPage";

function NotFoundPage() {
  return <h1>404 - Page Not Found</h1>;
}

export default function App() {
  return (
    <Routes>

       {/* Main Application */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
    

        <Route
          path="/projects"
          element={<ProjectsPage />}
        />

        <Route
          path="/requirements"
          element={<RequirementsPage />}
        />

        <Route
          path="/test-scenarios"
          element={<TestScenariosPage />}
        />

        <Route
          path="/test-cases"
          element={<TestCasesPage />}

      
        />
        <Route
          path="/test-suites"
          element={<TestSuitesPage />}
        />

        <Route
          path="/test-runs"
          element={<TestRunsPage />}
        />

        <Route
          path="/test-runs/:id"
          element={<TestRunDetailsPage />}
        />

        <Route
          path="/test-runs/:runId/execute"
          element={<ExecutionPage />}
        />

        <Route
          path="/bugs"
          element={<BugsPage />}
        />

        <Route
          path="/reports"
          element={<ReportsPage />}
        />

        <Route
          path="/test-suites/:id/assign"
          element={<AssignTestCasesPage />}

        />

      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}