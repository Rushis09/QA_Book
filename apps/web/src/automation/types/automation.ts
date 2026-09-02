export interface AutomationProject {
  id: number;
  project_id: number;
  name: string;
  framework: string;
  status: string;
  repository_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationProjectCreateRequest {
  project_id: number;
  name: string;
  framework: string;
  status?: string;
  repository_url?: string | null;
}

export interface AutomationProjectUpdateRequest {
  name: string;
  framework: string;
  status: string;
  repository_url?: string | null;
}

export interface AutomationTestMapping {
  id: number;
  automation_project_id: number;
  test_case_id: number;
  test_name: string;
  test_file_path: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationTestMappingCreateRequest {
  automation_project_id: number;
  test_case_id: number;
  test_name: string;
  test_file_path: string;
}

export interface AutomationTestMappingUpdateRequest {
  test_name: string;
  test_file_path: string;
}