export type TaskStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED';

export type MaintenanceResult = 'PASSED' | 'FAILED' | 'REQUIRES_FOLLOW_UP';

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  engineerId: string;
  engineerName: string;
  scheduledDate: string;
  status: TaskStatus;
  generatedByPlanner: boolean;
  completedAt?: string | null;
}

export interface CompleteTaskRequest {
  observations: string;
  result: MaintenanceResult;
  performedAt?: string | null;
}

export interface MaintenanceReportResponse {
  id: string;
  taskId: string;
  equipmentId: string;
  equipmentName: string;
  engineerId: string;
  engineerName: string;
  scheduledDate: string;
  observations: string;
  result: MaintenanceResult;
  performedAt: string;
  createdAt: string;
}