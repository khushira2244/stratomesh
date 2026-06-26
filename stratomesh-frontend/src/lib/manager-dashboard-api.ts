const MANAGER_API_BASE =
  process.env.NEXT_PUBLIC_MANAGER_API_BASE ||
  "http://localhost:3001/api/insurance-company";

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || `Request failed: ${response.status} ${url}`
    );
  }

  return data as T;
}

export async function getManagerObservations() {
  return requestJson<any>(`${MANAGER_API_BASE}/manager/observations`);
}

export async function getInsuranceCases() {
  return requestJson<any>(`${MANAGER_API_BASE}/cases`);
}

export async function getExternalBrokerIssuesForManager() {
  return requestJson<any>(
    `${MANAGER_API_BASE}/external/broker-requests?managerObservationRequired=true`
  );
}

export async function getExternalBrokerIssuesByCase(caseId: string) {
  return requestJson<any>(
    `${MANAGER_API_BASE}/external/broker-requests?caseId=${encodeURIComponent(
      caseId
    )}`
  );
}

export async function getCaseDetail(caseId: string) {
  return requestJson<any>(`${MANAGER_API_BASE}/cases/${caseId}`);
}