import type { EngineerSummary } from './engineers';

export type EquipmentSeasonType = 'HEAT' | 'COLD' | 'UNIVERSAL';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  categoryName: string;
  active: boolean;
  seasonType: EquipmentSeasonType;
  frequencyPerYear: number;
  estimatedDurationMinutes: number;
  serialNumber?: string | null;
  notes?: string | null;
  activeMonths: number[];
  defaultEngineer?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}
export interface EquipmentSummary {
  id: string;
  name: string;
  seasonType: EquipmentSeasonType;
  code: string;
}

export interface CreateEquipmentRequest {
  name: string;
  code: string;
  active: boolean;
  seasonType: EquipmentSeasonType;
  frequencyPerYear: number;
  estimatedDurationMinutes: number;
  serialNumber?: string | null;
  notes?: string | null;
  defaultEngineerId?: string | null;
  activeMonths: number[];
  categoryId: string;
}

export interface UpdateEquipmentRequest {
  name: string;
  code: string;
  active: boolean;
  seasonType: EquipmentSeasonType;
  frequencyPerYear: number;
  estimatedDurationMinutes: number;
  serialNumber?: string | null;
  notes?: string | null;
  defaultEngineerId?: string | null;
  activeMonths: number[];
}