import { httpClient } from './httpClient';
import type {
  PlanningRequest,
  PlanningResult,
} from '../types/planning.ts';

const BASE_URL = '/api/planning';

export function generatePlan(
  payload: PlanningRequest
): Promise<PlanningResult> {
  return httpClient<PlanningResult>(`${BASE_URL}/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function generatePlanForEquipment(
  equipmentId: string,
  payload: PlanningRequest
): Promise<PlanningResult> {
  return httpClient<PlanningResult>(`${BASE_URL}/equipments/${equipmentId}/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}