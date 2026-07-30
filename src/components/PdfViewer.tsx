"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RenderTask } from "pdfjs-dist";
import { usePdfDocument } from "@/hooks/usePdfDocument";

interface PdfViewerProps {
  src: string;
  title: string;
  className?: string;
  minHeight?: string;
  /** CSS aspect-ratio for the viewport frame (e.g. "3 / 2"). PDF fits inside contain-style. */
  aspectRatio?: string;
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.15;

export function PdfViewer({
  src,
  title,
  className = "",
  minHeight = "28rem",
  aspectRatio,
}: PdfViewerProps) {
  const { pdf, numPages, loading, error } = usePdfDocument(src);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const displayError = error ?? renderError;

  const goToPage = useCallback(
    (next: number) => {
      if (!numPages) return;
      setPageNumber(Math.min(Math.max(1, next), numPages));
    },
    [numPages]
  );

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current || !viewportRef.current) return;

    const container = viewportRef.current;
    const styles = getComputedStyle(container);
    const padX =
      (parseFloat(styles.paddingLeft) || 0) +
      (parseFloat(styles.paddingRight) || 0);
    const padY =
      (parseFloat(styles.paddingTop) || 0) +
      (parseFloat(styles.paddingBottom) || 0);
    // clientWidth/Height include padding; fit against the content box only.
    const availableWidth = Math.max(0, container.clientWidth - padX);
    const availableHeight = Math.max(0, container.clientHeight - padY);

    // Wait for the aspect-ratio frame to resolve a real height before fitting.
    if (aspectRatio && availableWidth <= 0) return;
    if (aspectRatio && fitWidth && availableHeight <= 0) return;

    renderTaskRef.current?.cancel();
    setRendering(true);
    setRenderError(null);

    try {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });

      let fitScale = availableWidth / baseViewport.width;
      if (aspectRatio && availableHeight > 0) {
        fitScale = Math.min(
          availableWidth / baseViewport.width,
          availableHeight / baseViewport.height
        );
      }

      // Aspect-ratio "fit" must match the frame exactly (no min/max clamp),
      // otherwise the canvas overshoots and triggers scroll + stretch via max-w-full.
      const renderScale = fitWidth
        ? aspectRatio
          ? fitScale
          : Math.min(Math.max(fitScale, MIN_SCALE), MAX_SCALE)
        : scale;
      const viewport = page.getViewport({ scale: renderScale });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const task = page.render({
        canvasContext: context,
        viewport,
      });
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err instanceof Error && err.message.includes("cancelled")) return;
      console.error(err);
      setRenderError(
        err instanceof Error ? err.message : "Failed to render PDF page."
      );
    } finally {
      setRendering(false);
    }
  }, [aspectRatio, fitWidth, pageNumber, pdf, scale]);

  useEffect(() => {
    setPageNumber(1);
    setScale(1);
    setFitWidth(true);
    setRenderError(null);
  }, [src]);

  useEffect(() => {
    void renderPage();
    return () => renderTaskRef.current?.cancel();
  }, [renderPage]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const observer = new ResizeObserver(() => {
      if (fitWidth) void renderPage();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fitWidth, renderPage]);

  const zoomIn = () => {
    setFitWidth(false);
    setScale((s) => Math.min(s + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setFitWidth(false);
    setScale((s) => Math.max(s - SCALE_STEP, MIN_SCALE));
  };

  const resetZoom = () => {
    setFitWidth(true);
    setScale(1);
  };

  const frameStyle = aspectRatio ? { aspectRatio } : { minHeight };

  return (
    <div className={className}>
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-b-0 border-silver/20 bg-surface-navy px-3 py-2"
        role="toolbar"
        aria-label={`${title} controls`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(pageNumber - 1)}
            disabled={loading || pageNumber <= 1 || !!displayError}
            className="rounded-md border border-silver/30 px-2.5 py-1.5 text-sm text-text-muted hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            Prev
          </button>
          <span className="min-w-[7rem] text-center text-sm text-text-muted">
            {loading ? "Loading…" : `Page ${pageNumber} of ${numPages || "—"}`}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pageNumber + 1)}
            disabled={
              loading || !numPages || pageNumber >= numPages || !!displayError
            }
            className="rounded-md border border-silver/30 px-2.5 py-1.5 text-sm text-text-muted hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            Next
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={zoomOut}
            disabled={loading || !!displayError}
            className="rounded-md border border-silver/30 px-2.5 py-1.5 text-sm text-text-muted hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetZoom}
            disabled={loading || !!displayError}
            className="rounded-md border border-silver/30 px-2.5 py-1.5 text-sm text-text-muted hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={aspectRatio ? "Fit to frame" : "Fit to width"}
          >
            Fit
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={loading || !!displayError}
            className="rounded-md border border-silver/30 px-2.5 py-1.5 text-sm text-text-muted hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div
        className={`rounded-b-lg border border-silver/20 bg-bg-deep ${
          aspectRatio && fitWidth ? "overflow-hidden" : "overflow-auto"
        }`}
        style={frameStyle}
        aria-busy={loading || rendering}
      >
        {loading && (
          <p className="flex h-full min-h-[inherit] items-center justify-center p-8 text-sm text-text-muted">
            Loading PDF…
          </p>
        )}

        {displayError && (
          <div className="flex h-full flex-col justify-center space-y-3 p-4">
            <p className="text-center text-sm text-red-400">
              Could not render PDF in-page: {displayError}
            </p>
            <iframe
              src={src}
              title={title}
              className="w-full flex-1 rounded border border-silver/20 bg-white"
              style={
                aspectRatio ? { minHeight: "12rem" } : { height: "36rem" }
              }
            />
            <p className="text-center text-xs text-text-muted">
              If the preview is blank,{" "}
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue underline decoration-blue/40 underline-offset-2"
              >
                open the PDF directly
              </a>
              .
            </p>
          </div>
        )}

        {!loading && !displayError && (
          <div
            ref={viewportRef}
            className={
              aspectRatio
                ? "box-border flex h-full w-full items-center justify-center overflow-hidden p-3"
                : "flex justify-center p-4"
            }
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`${title}, page ${pageNumber}`}
              // Aspect-ratio mode sets exact CSS px size from contain-fit;
              // max-w-full would squash width only and visually stretch the page.
              className={
                aspectRatio ? "block rounded shadow-lg" : "max-w-full rounded shadow-lg"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
