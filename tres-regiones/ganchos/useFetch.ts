"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/biblioteca/pokeapi";

type Result<T> = {
  url: string;
  data: T | null;
  error: string | null;
};

export function useFetch<T>(url: string | null): {
  data: T | null;
  error: string | null;
  loading: boolean;
} {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    fetchJson<T>(url, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({ url, data, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Error de red";
        setResult({ url, data: null, error: message });
      });

    return () => controller.abort();
  }, [url]);

  if (!url) {
    return { data: null, error: null, loading: false };
  }

  const matches = result?.url === url;
  return {
    data: matches ? result.data : null,
    error: matches ? result.error : null,
    loading: !matches,
  };
}

