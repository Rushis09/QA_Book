import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { projectService } from "../services/projectService";
import { useAuth } from "./AuthContext";
import type { Project } from "../types/project";

interface WorkspaceUser {
  id: number;
  username: string;
}

export type WorkspaceUserFilter =
  | "NONE"
  | "ALL"
  | number;

interface WorkspaceContextValue {
  projects: Project[];
  workspaceUsers: WorkspaceUser[];
  selectedProject: Project | null;
  isAllProjects: boolean;
  selectedUserFilter: WorkspaceUserFilter;
  loading: boolean;

  setSelectedProject: (
    project: Project | null,
  ) => void;

  setSelectedUserFilter: (
    userFilter: WorkspaceUserFilter,
  ) => Promise<void>;

  refreshProjects: () => Promise<void>;
}

const WorkspaceContext =
  createContext<
    WorkspaceContextValue | undefined
  >(undefined);

const PROJECT_STORAGE_KEY =
  "qabook-selected-project";

const USER_STORAGE_KEY =
  "qabook-selected-user";

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({
  children,
}: WorkspaceProviderProps) {
  const { account } = useAuth();

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [
    workspaceUsers,
    setWorkspaceUsers,
  ] = useState<WorkspaceUser[]>([]);

  const [
    selectedProject,
    setSelectedProjectState,
  ] = useState<Project | null>(null);

  const [
    isAllProjects,
    setIsAllProjects,
  ] = useState(false);

  const [
    selectedUserFilter,
    setSelectedUserFilterState,
  ] = useState<WorkspaceUserFilter>(
    "NONE",
  );

  const [loading, setLoading] =
    useState(true);

  const isPlatformAdmin =
    account?.role === "PLATFORM_ADMIN";

  async function refreshProjects(
    userFilterOverride?: WorkspaceUserFilter,
  ) {
    try {
      setLoading(true);

      let userFilter =
        userFilterOverride !== undefined
          ? userFilterOverride
          : selectedUserFilter;

      if (!isPlatformAdmin) {
        userFilter = account?.id ?? "NONE";
      }

      let ownerId: number | undefined;

      if (userFilter === "NONE") {
        ownerId = account?.id;
      } else if (
        typeof userFilter === "number"
      ) {
        ownerId = userFilter;
      } else {
        ownerId = undefined;
      }

      const data =
        await projectService.getProjects(
          ownerId,
        );

      setProjects(data);

      const storedProjectId =
        localStorage.getItem(
          PROJECT_STORAGE_KEY,
        );

      /*
       * "all" is now a real workspace scope.
       */
      if (
        storedProjectId === "all"
      ) {
        setSelectedProjectState(null);
        setIsAllProjects(true);
        return;
      }

      const storedProject =
        data.find(
          (project) =>
            project.id ===
            Number(storedProjectId),
        );

      if (storedProject) {
        setSelectedProjectState(
          storedProject,
        );
        setIsAllProjects(false);
      } else if (data.length > 0) {
        setSelectedProjectState(
          data[0],
        );

        setIsAllProjects(false);

        localStorage.setItem(
          PROJECT_STORAGE_KEY,
          String(data[0].id),
        );
      } else {
        setSelectedProjectState(null);
        setIsAllProjects(false);

        localStorage.removeItem(
          PROJECT_STORAGE_KEY,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function setSelectedProject(
    project: Project | null,
  ) {
    if (project === null) {
      /*
       * Selecting null explicitly means
       * "All Projects".
       */
      setSelectedProjectState(null);
      setIsAllProjects(true);

      localStorage.setItem(
        PROJECT_STORAGE_KEY,
        "all",
      );

      return;
    }

    setSelectedProjectState(project);
    setIsAllProjects(false);

    localStorage.setItem(
      PROJECT_STORAGE_KEY,
      String(project.id),
    );
  }

  async function setSelectedUserFilter(
    userFilter: WorkspaceUserFilter,
  ) {
    if (!isPlatformAdmin) {
      return;
    }

    setSelectedUserFilterState(
      userFilter,
    );

    if (userFilter === "NONE") {
      localStorage.setItem(
        USER_STORAGE_KEY,
        "none",
      );
    } else if (userFilter === "ALL") {
      localStorage.setItem(
        USER_STORAGE_KEY,
        "all",
      );
    } else {
      localStorage.setItem(
        USER_STORAGE_KEY,
        String(userFilter),
      );
    }

    /*
     * Changing the User Filter resets the
     * project selection to the first valid
     * project in that workspace.
     */
    setSelectedProjectState(null);
    setIsAllProjects(false);

    localStorage.removeItem(
      PROJECT_STORAGE_KEY,
    );

    await refreshProjects(userFilter);
  }

  useEffect(() => {
    if (!account) {
      return;
    }

    async function initializeWorkspace() {
      try {
        setLoading(true);

        if (isPlatformAdmin) {
          const users =
            await projectService.getWorkspaceUsers();

          setWorkspaceUsers(users);

          const storedUser =
            localStorage.getItem(
              USER_STORAGE_KEY,
            );

          let initialUserFilter: WorkspaceUserFilter =
            "NONE";

          if (storedUser === "all") {
            initialUserFilter = "ALL";
          } else if (
            storedUser &&
            storedUser !== "none"
          ) {
            const parsedUserId =
              Number(storedUser);

            const userExists =
              users.some(
                (user) =>
                  user.id ===
                  parsedUserId,
              );

            if (userExists) {
              initialUserFilter =
                parsedUserId;
            }
          }

          setSelectedUserFilterState(
            initialUserFilter,
          );

          await refreshProjects(
            initialUserFilter,
          );
        } else {
          setWorkspaceUsers([]);

          setSelectedUserFilterState(
            account!.id,
          );

          await refreshProjects(
            account!.id,
          );
        }
      } catch (error) {
        console.error(error);

        setProjects([]);
        setWorkspaceUsers([]);
        setSelectedProjectState(null);
        setIsAllProjects(false);
      } finally {
        setLoading(false);
      }
    }

    initializeWorkspace();
  }, [
    account,
    isPlatformAdmin,
  ]);

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        workspaceUsers,
        selectedProject,
        isAllProjects,
        selectedUserFilter,
        loading,
        setSelectedProject,
        setSelectedUserFilter,
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