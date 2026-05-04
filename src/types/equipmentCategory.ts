export interface EquipmentCategory {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
}

export interface CreateEquipmentCategoryRequest {
  name: string;
  description?: string | null;
  active: boolean;
}