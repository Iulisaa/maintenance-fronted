import type { MaintenanceTask } from '../types/task';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function getEngineerAgendaTasks(
  engineerId: string,
  startDate: string,
  endDate: string
): Promise<MaintenanceTask[]> {
  const response = await fetch(
    `${API_BASE_URL}startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch engineer agenda tasks: ${response.status}`);
  }

  return response.json();
}