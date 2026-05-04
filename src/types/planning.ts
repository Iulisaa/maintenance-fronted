export interface PlanningRequest {
  startDate: string;
  endDate: string;
}

export interface PlanningResult {
  generatedTasks: number;
  skippedEquipments: string[];
}