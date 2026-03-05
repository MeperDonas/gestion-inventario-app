"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ImportJobStatus, ImportStartResponse } from "@/types";

type RetryPayload = {
  rowIndex: number;
  correctedData: Record<string, unknown>;
};

export function useImport() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const [startData, setStartData] = useState<ImportStartResponse | null>(null);

  const startImport = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return api
        .postWithFormData<ImportStartResponse>("/imports/products", formData)
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      setStartData(data);
    },
  });

  const statusQuery = useQuery({
    queryKey: ["imports", "products", jobId],
    queryFn: () =>
      api
        .get<ImportJobStatus>(`/imports/${jobId}/status`)
        .then((res) => res.data),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PARSING" || status === "PROCESSING") {
        return 1000;
      }

      return false;
    },
  });

  const retryRow = useMutation({
    mutationFn: (payload: RetryPayload) => {
      if (!jobId) {
        throw new Error("No hay un trabajo de importacion activo");
      }

      return api
        .post<ImportJobStatus>(`/imports/${jobId}/retry-row`, payload)
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      if (!jobId) {
        return;
      }

      queryClient.setQueryData(["imports", "products", jobId], data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const downloadTemplate = useMutation({
    mutationFn: () => api.downloadData("/imports/products/template"),
  });

  const reset = () => {
    if (jobId) {
      queryClient.removeQueries({ queryKey: ["imports", "products", jobId] });
    }

    setJobId(null);
    setStartData(null);
    startImport.reset();
    retryRow.reset();
  };

  return {
    jobId,
    startData,
    startImport,
    statusQuery,
    retryRow,
    downloadTemplate,
    reset,
  };
}
