export interface Engineer {
  id: string;
  name: string;
  email: string;
  active: boolean;
  maxTasksPerDay: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EngineerSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface CreateEngineerRequest {
  name: string;
  email: string;
  maxTasksPerDay: number;
}

export interface UpdateEngineerRequest {
  fullName: string;
  email: string;
  active: boolean;
  maxTasksPerDay: number;
}