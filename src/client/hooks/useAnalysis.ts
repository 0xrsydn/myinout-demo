import { useState, useEffect, useCallback } from "react";
import type { AnalysisResult } from "../../shared/types";
import { fetchAnalysis, type AnalysisParams } from "../lib/api";

interface UseAnalysisOptions {
  pocketId: string;
  startDate?: string;
  endDate?: string;
  includeLlm?: boolean;
  autoFetch?: boolean;
}

interface UseAnalysisReturn {
  data: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalysis({
  pocketId,
  startDate,
  endDate,
  includeLlm = false,
  autoFetch = true,
}: UseAnalysisOptions): UseAnalysisReturn {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!pocketId) {
      setError("Pocket ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: AnalysisParams = {
        pocketId,
        startDate,
        endDate,
        includeLlm,
      };

      const result = await fetchAnalysis(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analysis");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [pocketId, startDate, endDate, includeLlm]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useAnalysis;
