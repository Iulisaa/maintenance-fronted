import type { CreateEngineerRequest, Engineer } from "../types/engineers";

const BASE_URL = "/api/engineers";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function getEngineers(): Promise<Engineer[]> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<Engineer[]>(response);
}

export async function createEngineer(payload: CreateEngineerRequest): Promise<Engineer> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Engineer>(response);
}