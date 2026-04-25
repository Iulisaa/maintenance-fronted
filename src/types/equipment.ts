export type EquipmentSeasonType = "HEAT" | "COLD" | "UNIVERSAL";

export interface Equipment {
  id: string;
  name: string;
  code: string;
  active: boolean;
  seasonType: EquipmentSeasonType;
  serialNumber?: string | null;
  notes?: string | null;
  assignedEngineerId: string;
  assignedEngineerName: string;
  recurrencePerYear?: number | null;
  estimatedDurationMinutes?: number | null;
  activeMonths: number[];
  reportTemplateCode?: string | null;
}

export interface CreateEquipmentRequest {
  name: string;
  code: string;
  active: boolean;
  seasonType: EquipmentSeasonType;
  serialNumber?: string | null;
  notes?: string | null;
  assignedEngineerId: string;
  recurrencePerYear: number;
  estimatedDurationMinutes: number;
  reportTemplateCode: string;
}