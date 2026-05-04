import type { EngineerSummary } from './engineers';
import type { EquipmentSummary } from './equipment';

export type TaskStatus =
  | 'PLANNED'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED';

export type TaskSource = 'GENERATED' | 'MANUAL';

export type InspectionResult = 'PASSED' | 'FAILED' | 'FOLLOW_UP';

export type TaskFilter = 'ALL' | 'PLANNED' | 'COMPLETED' | 'FOLLOW_UP' | 'FAILED';

export interface InspectionTask {
  id: string;
  equipment: EquipmentSummary;
  assignedEngineer: EngineerSummary | null;
  plannedDate: string;
  plannedYear: number;
  occurrenceNumber: number | null;
  generationKey: string | null;
  source: TaskSource;
  status: TaskStatus;
  result: InspectionResult | null;
  inspectionReportId?: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  code: string;
}

export type MaintenanceTask = InspectionTask;


export interface CreateManualInspectionTaskRequest {
  equipmentId: string;
  assignedEngineerId?: string | null;
  plannedDate: string;
}

export interface ReassignInspectionTaskRequest {
  assignedEngineerId: string;
}

export interface MoveInspectionTaskRequest {
  plannedDate: string;
}

export interface CompleteTaskRequest {
  observations: string;
  result: InspectionResult;
  performedAt: string | null;
  reportTemplateCode: string;
}

export interface CompleteTaskItemRequest {
  taskId: string;
  observations: string;
  result: InspectionResult;
}

export interface CompleteTasksRequest {
  items: CompleteTaskItemRequest[];
  performedAt: string | null;
  reportTemplateCode: string;
}

export interface EquipmentInspectionHistoryItem {
  performedAt: string | null;
  observations: string | null;
  result: InspectionResult | null;
  engineerName: string | null;
  reportNumber: string | null;
  fileName: string | null;
}