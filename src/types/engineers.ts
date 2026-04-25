export interface Engineer {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  maxTasksPerDay: number;
}

export interface CreateEngineerRequest {
  fullName: string;
  email: string;
  active: boolean;
  maxTasksPerDay: number;
}