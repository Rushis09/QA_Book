export interface RequirementProject {
  id: number;
  project_code: string;
  name: string;
}

export interface Requirement {
  id: number;
  requirement_code: string;
  project_id: number;
  project: RequirementProject;
  module: string;
  priority: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}