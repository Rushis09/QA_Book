export interface TestRunFormData {
  suite_id: number;
  name: string;
  build_version: string;
  environment: string;
  tester: string;
  start_date: string;
  end_date: string;
  status: string;
}