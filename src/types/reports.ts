import type { EngineerSummary } from './engineers';
import type { EquipmentSummary } from './equipment';
import type { InspectionResult, TaskStatus } from './task';

export type InspectionReportType = 'SINGLE_TASK' | 'BULK';
export type InspectionReportStatus = 'DRAFT' | 'GENERATED' | 'FINALIZED';

export interface InspectionTaskSummary {
  id: string;
  equipment: EquipmentSummary;
  plannedDate: string;
  status: TaskStatus;
}

export interface CreateInspectionReportRequest {
  reportType: InspectionReportType;
  reportTemplateCode: string;
  items: CreateInspectionReportItemRequest[];
}

export interface CreateInspectionReportItemRequest {
  inspectionTaskId: string;
  engineerId: string;
  result: InspectionResult;
  observations: string;
  performedAt?: string | null;
}

export interface UpdateInspectionReportItemRequest {
  result: InspectionResult;
  observations: string;
  performedAt: string;
}

export interface FinalizeInspectionReportRequest {
  fileName: string;
  contentType: string;
  storagePath: string;
  fileSizeBytes: number;
}

export interface InspectionReportItem {
  id: string;
  inspectionTask: InspectionTaskSummary;
  engineer: EngineerSummary;
  result: InspectionResult;
  observations: string;
  performedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionReport {
  id: string;
  reportNumber: string;
  reportType: InspectionReportType;
  status: InspectionReportStatus;
  reportTemplateCode: string;
  fileName?: string | null;
  contentType?: string | null;
  storagePath?: string | null;
  fileSizeBytes?: number | null;
  generatedAt?: string | null;
  finalizedAt?: string | null;
  items: InspectionReportItem[];
  createdAt: string;
  inspectionReportId?: string | null;
  updatedAt: string;
}

export interface InspectionReportItemDto {
  id: string;
  inspectionTaskId: string;
  equipmentId: string;
  equipmentName: string;
  engineerId: string;
  engineerName: string;
  plannedDate: string;
  observations: string;
  result: InspectionResult;
  performedAt: string;
  createdAt: string;
}

export interface CompletedInspectionReportResponse {
  reportId: string;
  reportNumber: string;
  reportType: InspectionReportType;
  reportStatus: InspectionReportStatus;
  fileName?: string | null;
  contentType?: string | null;
  storagePath?: string | null;
  generatedAt?: string | null;
  finalizedAt?: string | null;
  item: InspectionReportItemDto;
}