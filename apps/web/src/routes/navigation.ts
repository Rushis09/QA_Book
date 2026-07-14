import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ViewListIcon from "@mui/icons-material/ViewList";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BugReportIcon from "@mui/icons-material/BugReport";
import AssessmentIcon from "@mui/icons-material/Assessment";

import type { NavigationItem } from "../types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: DashboardIcon,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FolderIcon,
  },
  {
    label: "Requirements",
    path: "/requirements",
    icon: DescriptionIcon,
  },
  {
    label: "Test Scenarios",
    path: "/test-scenarios",
    icon: FactCheckIcon,
  },
  {
    label: "Test Cases",
    path: "/test-cases",
    icon: ChecklistIcon,
  },
  {
    label: "Test Suites",
    path: "/test-suites",
    icon: ViewListIcon,
  },
  {
    label: "Test Runs",
    path: "/test-runs",
    icon: PlayArrowIcon,
  },
  {
    label: "Bug Reports",
    path: "/bugs",
    icon: BugReportIcon,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: AssessmentIcon,
  },
];
