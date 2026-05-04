import { httpClient } from './httpClient';
import type {
  CompleteTaskRequest,
  CompleteTasksRequest,
  InspectionTask,
  TaskFilter, EquipmentInspectionHistoryItem,
  ReassignInspectionTaskRequest,
} from '../types/task';
import type { CompletedInspectionReportResponse } from '../types/reports';

const TASKS_BASE_URL = '/api/inspection-tasks';
const REPORTS_BASE_URL = '/api/inspection-reports';

function buildUrl(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function completeTask(
  taskId: string,
  payload: CompleteTaskRequest,
): Promise<CompletedInspectionReportResponse> {
  return httpClient<CompletedInspectionReportResponse>(
    `${REPORTS_BASE_URL}/tasks/${taskId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function completeTasks(
  payload: CompleteTasksRequest,
): Promise<CompletedInspectionReportResponse> {
  return httpClient<CompletedInspectionReportResponse>(
    `${REPORTS_BASE_URL}/complete`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getTasksForEngineer(
  engineerId: string,
  startDate: string,
  endDate: string,
  filter: TaskFilter = 'PLANNED',
): Promise<InspectionTask[]> {
  const params = new URLSearchParams();

  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('filter', filter);

  return httpClient<InspectionTask[]>(
    buildUrl(`${TASKS_BASE_URL}/engineers/${engineerId}`, params),
  );
}

export async function downloadInspectionReportPdfByTaskId(
  taskId: string,
): Promise<void> {
  const response = await fetch(`${REPORTS_BASE_URL}/tasks/${taskId}/pdf`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to download inspection report PDF.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `inspection-report-${taskId}.pdf`;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

export function getEquipmentHistoryForTask(
  taskId: string,
): Promise<EquipmentInspectionHistoryItem[]> {
  return httpClient<EquipmentInspectionHistoryItem[]>(
    `${TASKS_BASE_URL}/${taskId}/equipment-history`,
  );
}

export function reassignInspectionTask(
  taskId: string,
  payload: ReassignInspectionTaskRequest,
): Promise<InspectionTask> {
  return httpClient<InspectionTask>(
    `${TASKS_BASE_URL}/${taskId}/reassign`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}