import type { ApiResponse, AnalysisResult } from "../../shared/types";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3000";

export interface AnalysisParams {
  pocketId: string;
  startDate?: string;
  endDate?: string;
  includeLlm?: boolean;
}

/**
 * Fetch financial analysis from the API
 */
export async function fetchAnalysis(
  params: AnalysisParams
): Promise<AnalysisResult> {
  const queryParams = new URLSearchParams({
    pocket_id: params.pocketId,
  });

  if (params.startDate) {
    queryParams.set("start_date", params.startDate);
  }
  if (params.endDate) {
    queryParams.set("end_date", params.endDate);
  }
  if (params.includeLlm) {
    queryParams.set("include_llm", "true");
  }

  const response = await fetch(
    `${API_BASE}/api/v1/analysis?${queryParams.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<AnalysisResult> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch analysis");
  }

  return data.data;
}

/**
 * Fetch LLM-enhanced insights only
 */
export async function fetchLlmInsights(
  params: AnalysisParams
): Promise<AnalysisResult["insights"]> {
  const queryParams = new URLSearchParams({
    pocket_id: params.pocketId,
    include_llm: "true",
  });

  if (params.startDate) {
    queryParams.set("start_date", params.startDate);
  }
  if (params.endDate) {
    queryParams.set("end_date", params.endDate);
  }

  const response = await fetch(
    `${API_BASE}/api/v1/analysis?${queryParams.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<AnalysisResult> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch LLM insights");
  }

  return data.data.insights;
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<{
  status: string;
  dataset: { loaded: boolean };
  features: { llm_available: boolean };
}> {
  const response = await fetch(`${API_BASE}/api/v1/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}
