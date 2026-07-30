"use client";

import { useEffect, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;

/** pdf.js 5+/6 use Map.getOrInsertComputed (not in all browsers yet). */
function ensureMapPolyfills() {
  const proto = Map.prototype as Map<unknown, unknown> & {
    getOrInsertComputed?: (
      key: unknown,
      callbackFn: (key: unknown) => unknown
    ) => unknown;
  };
  if (typeof proto.getOrInsertComputed !== "function") {
    Object.defineProperty(proto, "getOrInsertComputed", {
      configurable: true,
      writable: true,
      value(
        this: Map<unknown, unknown>,
        key: unknown,
        callbackFn: (key: unknown) => unknown
      ) {
        if (this.has(key)) return this.get(key);
        const value = callbackFn(key);
        this.set(key, value);
        return value;
      },
    });
  }
}

async function loadPdfJs() {
  ensureMapPolyfills();
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjs;
}

export function usePdfDocument(src: string) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;

    setLoading(true);
    setError(null);
    setPdf(null);
    setNumPages(0);

    void (async () => {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        task = pdfjs.getDocument({ url: src });
        const loaded = await task.promise;
        if (cancelled) return;

        setPdf(loaded);
        setNumPages(loaded.numPages);
        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load PDF document.";
        setError(message);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [src]);

  return { pdf, numPages, loading, error };
}
