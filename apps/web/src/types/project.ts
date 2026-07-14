export interface Project {
  id: number;
  project_code: string;
  name: string;
  description: string | null;
  status: string;
  version: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRequest {
  name: string;
  description: string | null;
  status: string;
  version: string | null;
  start_date: string | null;
  end_date: string | null;
}