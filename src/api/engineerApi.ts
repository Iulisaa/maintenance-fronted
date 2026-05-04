import { httpClient } from './httpClient';
import type {
  CreateEngineerRequest,
  Engineer,
  UpdateEngineerRequest,
} from '../types/engineers';

const BASE_URL = '/api/engineers';

export function getEngineers(): Promise<Engineer[]> {
  return httpClient<Engineer[]>(BASE_URL);
}

export function getEngineerById(engineerId: string): Promise<Engineer> {
  return httpClient<Engineer>(`${BASE_URL}/${engineerId}`);
}

export function createEngineer(payload: CreateEngineerRequest): Promise<Engineer> {
  return httpClient<Engineer>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEngineer(
  engineerId: string,
  payload: UpdateEngineerRequest,
): Promise<Engineer> {
  return httpClient<Engineer>(`${BASE_URL}/${engineerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteEngineer(engineerId: string): Promise<void> {
  return httpClient<void>(`${BASE_URL}/${engineerId}`, {
    method: 'DELETE',
  });
}