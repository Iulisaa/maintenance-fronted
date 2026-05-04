import { httpClient } from './httpClient';
import type {
  CreateEquipmentRequest,
  Equipment,
  UpdateEquipmentRequest,
} from '../types/equipment';

const BASE_URL = '/api/equipments';

export async function getEquipments(categoryId?: string): Promise<Equipment[]> {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  const response = await fetch(`/api/equipments${query}`);

  if (!response.ok) {
    throw new Error('Failed to load equipment.');
  }

  return response.json();
}

export function getEquipmentById(equipmentId: string): Promise<Equipment> {
  return httpClient<Equipment>(`${BASE_URL}/${equipmentId}`);
}

export function createEquipment(
  payload: CreateEquipmentRequest,
): Promise<Equipment> {
  return httpClient<Equipment>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEquipment(
  id: string,
  payload: UpdateEquipmentRequest,
): Promise<Equipment> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to update equipment');
  }

  return response.json();
}
export function deleteEquipment(equipmentId: string): Promise<void> {
  return httpClient<void>(`${BASE_URL}/${equipmentId}`, {
    method: 'DELETE',
  });
}