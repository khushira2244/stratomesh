const API_BASE = "/backend-api/insurance-company";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

async function readJsonSafely(response: Response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed with ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Backend did not return JSON: ${text.slice(0, 120)}`);
  }
}

export async function getTeamCases(teamSlug: string) {
  const response = await fetch(`${API_BASE}/teams/${teamSlug}/cases`, {
    cache: "no-store",
  });

  return readJsonSafely(response);
}

export function getAllCases() {
  return requestJson<any>(`${API_BASE}/cases`);
}

export function getCaseDetail(caseId: string) {
  return requestJson<any>(`${API_BASE}/cases/${caseId}`);
}

export function updateCaseBlock(
  caseId: string,
  blockId: string,
  payload: Record<string, any>
) {
  return requestJson<any>(`${API_BASE}/cases/${caseId}/blocks/${blockId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addCaseBlock(caseId: string, payload: Record<string, any>) {
  return requestJson<any>(`${API_BASE}/cases/${caseId}/blocks/add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function progressCase(caseId: string, blockId?: string) {
  return requestJson<any>(`${API_BASE}/cases/${caseId}/progress`, {
    method: "PATCH",
    body: JSON.stringify(blockId ? { blockId } : {}),
  });
}