import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import LoginPage from "./components/auth/LoginPage";
import LandingPage from "./pages/Landing/LandingPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import { useAuth } from "./contexts/AuthContext";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import ProjectWorkspacePage from "./pages/Projects/ProjectWorkspacePage";
import TestingStudioPage from "./pages/TestingStudio/TestingStudioPage";
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
import AutomationPage from "./automation/pages/AutomationPage";
import TestExecutionsListPage from "./pages/TestExecutions/TestExecutionsListPage";
import ReportFocusBridge from "./components/common/ReportFocusBridge";
import SettingsPage from "./pages/Settings/SettingsPage";

function NotFoundPage() {
  return <h1>404 - Page Not Found</h1>;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ReportFocusBridge />

      <Routes>
        {/* Public route */}
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        {!isAuthenticated ? (
          <>
            {/* Landing page */}
            <Route
              path="/"
              element={<LandingPage />}
            />

            {/* Login page */}
            <Route
              path="/login"
              element={<LoginPage />}
            />

            {/* Any unknown/protected route while logged out */}
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </>
        ) : (
          <>
            {/* Logged-in users should not see login */}
            <Route
              path="/login"
              element={<Navigate to="/" replace />}
            />

            {/* Application */}
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<DashboardPage />}
              />

              <Route
                path="/projects"
                element={<ProjectsPage />}
              />

              {/* Project Workspace */}
              <Route
                path="/projects/:id/testing-studio"
                element={<TestingStudioPage />}
              />

              <Route
                path="/projects/:id"
                element={<ProjectWorkspacePage />}
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
                path="/automation"
                element={<AutomationPage />}
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
                path="/test-executions"
                element={<TestExecutionsListPage />}
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
                path="/settings"
                element={<SettingsPage />}
              />

              <Route
                path="/test-suites/:id/assign"
                element={<AssignTestCasesPage />}
              />
            </Route>

            {/* Unknown authenticated route */}
            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </>
        )}
      </Routes>
    </>
  );
}