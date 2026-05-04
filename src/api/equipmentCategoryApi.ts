import type {
  CreateEquipmentCategoryRequest,
  EquipmentCategory,
} from '../types/equipmentCategory';

const API_BASE_URL = '/api/equipment-categories';

export async function getEquipmentCategories(): Promise<EquipmentCategory[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to load equipment categories.');
  }

  return response.json();
}

export async function createEquipmentCategory(
  payload: CreateEquipmentCategoryRequest,
): Promise<EquipmentCategory> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create equipment category.');
  }

  return response.json();
}