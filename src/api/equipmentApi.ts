import { apiFetch } from '../utils/http';
import type { CreateEquipmentRequest, Equipment } from '../types/equipment';

export function getEquipments(): Promise<Equipment[]> {
  return apiFetch<Equipment[]>('/api/equipments');
}

export function createEquipment(payload: CreateEquipmentRequest): Promise<Equipment> {
  return apiFetch<Equipment>('/api/equipments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
