import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { projectService } from "../services/projectService";
import type { Project } from "../types/project";

interface WorkspaceContextValue {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  setSelectedProject: (
    project: Project,
  ) => void;
  refreshProjects: () => Promise<void>;
}

const WorkspaceContext =
  createContext<
    WorkspaceContextValue | undefined
  >(undefined);

const STORAGE_KEY =
  "qabook-selected-project";

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({
  children,
}: WorkspaceProviderProps) {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [
    selectedProject,
    setSelectedProjectState,
  ] = useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refreshProjects() {
    try {
      setLoading(true);

      const data =
        await projectService.getProjects();

      setProjects(data);

      if (data.length === 0) {
        setSelectedProjectState(null);
        return;
      }

      const storedId =
        localStorage.getItem(
          STORAGE_KEY,
        );

      const storedProject =
        data.find(
          (project) =>
            project.id ===
            Number(storedId),
        );

      if (storedProject) {
        setSelectedProjectState(
          storedProject,
        );
      } else {
        setSelectedProjectState(data[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  function setSelectedProject(
    project: Project,
  ) {
    setSelectedProjectState(project);

    localStorage.setItem(
      STORAGE_KEY,
      String(project.id),
    );
  }

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        selectedProject,
        loading,
        setSelectedProject,
        refreshProjects,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context =
    useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider.",
    );
  }

  return context;
}