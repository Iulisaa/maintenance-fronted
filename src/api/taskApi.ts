import { apiFetch } from '../utils/http';
import type {
  CompleteTaskRequest,
  MaintenanceReportResponse,
  MaintenanceTask,
} from '../types/task';

export async function getPendingTasksForEngineer(
  engineerId: string,
  date: string
): Promise<MaintenanceTask[]> {
  const params = new URLSearchParams();

  if (date) {
    params.set('date', date);
  }

  const response = await fetch(`/api/tasks/engineers/${engineerId}/pending?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to load tasks.');
  }

  return response.json();
}

export function getTaskById(taskId: string): Promise<MaintenanceTask> {
  return apiFetch<MaintenanceTask>(`/api/tasks/${taskId}`);
}

export function completeTask(taskId: string, payload: CompleteTaskRequest): Promise<MaintenanceReportResponse> {
  return apiFetch<MaintenanceReportResponse>(`/api/reports/tasks/${taskId}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function getFileNameFromContentDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const match = header.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? null;
}

export async function generateTaskReportPdf(
  taskId: string,
  payload: CompleteTaskRequest
): Promise<void> {
  const response = await fetch(`/api/reports/tasks/${taskId}/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to generate report PDF.');
  }

  const blob = await response.blob();
  const fileName =
    getFileNameFromContentDisposition(response.headers.get('Content-Disposition')) ??
    `maintenance-report-${taskId}.pdf`;

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}
