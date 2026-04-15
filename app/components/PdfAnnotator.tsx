"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/** Shape returned by the AI */
export interface AnnotationHint {
  quote: string;      // exact substring to find in the PDF text layer
  suggestion: string; // what the user should do
  type: "error" | "ok" | "warning";
}

/** Internal resolved annotation with pixel coordinates */
interface ResolvedMarkup {
  page: number;
  x: number;   // canvas-pixel x (at BASE_SCALE)
  y: number;   // canvas-pixel y (at BASE_SCALE)
  w: number;   // canvas-pixel width
  h: number;   // canvas-pixel height
  label: string;
  type: "error" | "ok" | "warning";
}

interface PageRender {
  pageNum: number;
  canvas: HTMLCanvasElement;
  naturalWidth: number;
  naturalHeight: number;
  /** Raw text items extracted from PDF.js, in BASE_SCALE canvas-pixel space */
  textItems: { str: string; x: number; y: number; w: number; h: number }[];
}

const TYPE_COLORS = {
  error:   { fill: "rgba(255,69,58,0.18)",  stroke: "#ff453a", badgeBg: "#ff453a", text: "#fff", legendLabel: "Critical" },
  ok:      { fill: "rgba(225,255,1,0.12)",  stroke: "#E1FF01", badgeBg: "#E1FF01", text: "#000", legendLabel: "Strength" },
  warning: { fill: "rgba(255,159,10,0.15)", stroke: "#FF9F0A", badgeBg: "#FF9F0A", text: "#000", legendLabel: "Suggestion" },
};

interface Props {
  fileUrl: string;
  annotations: AnnotationHint[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}


const BASE_SCALE = 2.0;


function normalize(str: string) {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Find the bounding box of `quote` in the text items of a page.
 * Returns coordinates in BASE_SCALE canvas-pixel space, or null.
 */
function findQuote(
  items: PageRender["textItems"],
  quote: string
): { x: number; y: number; w: number; h: number } | null {
  const q = normalize(quote);
  if (!q) return null;

  // Build a flat string with a map from each character → item index
  let full = "";
  const charToItem: number[] = [];
  items.forEach((item, idx) => {
    const s = item.str;
    full += s + " ";
    for (let i = 0; i < s.length + 1; i++) charToItem.push(idx);
  });

  const hay = normalize(full);
  const pos = hay.indexOf(q);
  if (pos === -1) return null;

  const endPos = pos + q.length;
  const startItemIdx = charToItem[pos] ?? 0;
  const endItemIdx = charToItem[Math.min(endPos, charToItem.length - 1)] ?? startItemIdx;

  const covering = items.slice(startItemIdx, endItemIdx + 1);
  if (covering.length === 0) return null;

  const minX = Math.min(...covering.map(i => i.x));
  const minY = Math.min(...covering.map(i => i.y));
  const maxX = Math.max(...covering.map(i => i.x + i.w));
  const maxH = Math.max(...covering.map(i => i.h));

  return { x: minX, y: minY, w: maxX - minX, h: Math.max(maxH, 14) };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfAnnotator({ fileUrl, annotations, t }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageRender[]>([]);
  const [loading, setLoading] = useState(true);
  const [userScale, setUserScale] = useState(1.0);
  const [resolvedMarkups, setResolvedMarkups] = useState<ResolvedMarkup[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── PDF rendering + text extraction ──────────────────────────────────────
  const renderPdf = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib = (window as any).pdfjsLib;



      if (!pdfjsLib) { setLoading(false); return; }
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

      const pdf = await pdfjsLib.getDocument(fileUrl).promise;
      const rendered: PageRender[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: BASE_SCALE });

        // Render to canvas
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;

        // Extract text items with canvas-pixel coordinates
        const textContent = await page.getTextContent();
        const textItems = (textContent.items as { str: string; transform: number[]; width?: number }[])
          .filter((item) => item.str?.trim().length > 0)
          .map((item) => {
            const [, , , fontH, pdfX, pdfY] = item.transform;

            const [vx, vy] = viewport.convertToViewportPoint(pdfX, pdfY);
            const hPx = Math.abs(fontH) * viewport.scale;
            const wPx = (item.width ?? 0) * viewport.scale;
            return {
              str: item.str as string,
              x: vx,
              y: vy - hPx,       // baseline → top-of-text
              w: Math.max(wPx, 4),
              h: Math.max(hPx, 8),
            };
          });

        rendered.push({
          pageNum: i,
          canvas,
          naturalWidth: viewport.width,
          naturalHeight: viewport.height,
          textItems,
        });
      }
      setPages(rendered);
    } catch (err) {
      console.error("PDF render error:", err);
    }
    setLoading(false);
  }, [fileUrl]);

  useEffect(() => { renderPdf(); }, [renderPdf]);

  // ── Resolve annotations → pixel coordinates ───────────────────────────────
  useEffect(() => {
    if (pages.length === 0 || annotations.length === 0) {
      setResolvedMarkups([]);
      return;
    }
    const resolved: ResolvedMarkup[] = [];

    for (const hint of annotations) {
      let found = false;
      for (const page of pages) {
        const bounds = findQuote(page.textItems, hint.quote);
        if (bounds) {
          resolved.push({
            page: page.pageNum,
            ...bounds,
            label: hint.suggestion,
            type: hint.type,
          });
          found = true;
          break;
        }
      }
      // If quote not found on any page, skip silently
      if (!found) console.warn(`[PdfAnnotator] Quote not found: "${hint.quote}"`);
    }
    setResolvedMarkups(resolved);
  }, [pages, annotations]);

  // ── Display scale ─────────────────────────────────────────────────────────
  const getDisplayScale = useCallback(() => {
    const containerW = containerRef.current?.clientWidth ?? 600;
    const pageW = pages[0]?.naturalWidth ?? BASE_SCALE * 595;
    const padding = 32;
    return ((containerW - padding) / pageW) * userScale;
  }, [pages, userScale]);

  const displayScale = getDisplayScale();

  const handleZoom = (delta: number) => {
    setUserScale(prev => Math.min(3, Math.max(0.2, +(prev + delta).toFixed(2))));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border border-border bg-surface px-4 py-2 rounded-sm flex-shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-neutral font-bold">
          {pages.length > 0
            ? `${pages.length} ${t.pages} · ${Math.round(displayScale * 100)}% ${t.zoom}`
            : t.loading}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => handleZoom(-0.1)} className="w-7 h-7 border border-border flex items-center justify-center text-neutral hover:text-accent hover:border-accent transition-colors text-lg font-light">−</button>
          <button onClick={() => handleZoom(0.1)} className="w-7 h-7 border border-border flex items-center justify-center text-neutral hover:text-accent hover:border-accent transition-colors text-lg font-light">+</button>
          <button onClick={() => setUserScale(1.0)} className="px-2 h-7 border border-border text-[10px] uppercase tracking-widest text-neutral hover:text-accent hover:border-accent transition-colors font-bold">{t.reset}</button>
        </div>
      </div>

      {/* Document Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black/40 relative"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-neutral">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin"></div>
            <span className="text-xs uppercase tracking-widest font-bold">{t.renderingDocument}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 items-center">
            {pages.map(({ pageNum, canvas, naturalWidth, naturalHeight }) => {
              const pageMarkups = resolvedMarkups.filter(m => m.page === pageNum);
              const displayW = Math.round(naturalWidth * displayScale);
              const displayH = Math.round(naturalHeight * displayScale);

              return (
                <div
                  key={pageNum}
                  className="relative flex-shrink-0 shadow-2xl"
                  style={{ width: displayW, height: displayH }}
                >
                  {/* High-res canvas, CSS-scaled */}
                  <canvas
                    ref={el => {
                      if (el) {
                        el.width = canvas.width;
                        el.height = canvas.height;
                        el.getContext("2d")?.drawImage(canvas, 0, 0);
                      }
                    }}
                    className="absolute inset-0 block origin-top-left"
                    style={{ width: naturalWidth, height: naturalHeight, transform: `scale(${displayScale})` }}
                  />

                  {/* SVG: highlights + badges */}
                  <svg
                    className="absolute inset-0"
                    width={displayW}
                    height={displayH}
                    viewBox={`0 0 ${displayW} ${displayH}`}
                    style={{ overflow: "visible" }}
                  >
                    {pageMarkups.map((m, i) => {
                      const globalIdx = resolvedMarkups.indexOf(m);
                      const px = m.x * displayScale;
                      const py = m.y * displayScale;
                      const pw = m.w * displayScale;
                      const ph = Math.max(m.h * displayScale, 10);
                      const colors = TYPE_COLORS[m.type] || TYPE_COLORS.error;
                      const bx = px - 9;   // badge sits just left of the highlight
                      const by = py + ph / 2;
                      const isHovered = hoveredIdx === globalIdx;

                      return (
                        <g
                          key={i}
                          className="cursor-pointer"
                          onMouseEnter={(e) => {
                            setHoveredIdx(globalIdx);
                            const rect = containerRef.current!.getBoundingClientRect();
                            setTooltipPos({
                              x: e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0),
                              y: e.clientY - rect.top + (containerRef.current?.scrollTop ?? 0),
                            });
                          }}
                          onMouseMove={(e) => {
                            const rect = containerRef.current!.getBoundingClientRect();
                            setTooltipPos({
                              x: e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0),
                              y: e.clientY - rect.top + (containerRef.current?.scrollTop ?? 0),
                            });
                          }}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          {/* Highlight rect */}
                          <rect
                            x={px} y={py} width={pw} height={ph}
                            fill={isHovered ? colors.fill.replace("0.18", "0.35").replace("0.12", "0.28").replace("0.15", "0.30") : colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={isHovered ? "2" : "1.5"}
                            strokeDasharray={isHovered ? "0" : "5 2"}
                            rx="2"
                            style={{ transition: "all 0.15s ease" }}
                          />
                          {/* Numbered badge */}
                          <circle cx={bx} cy={by} r="9" fill={colors.badgeBg} />
                          <text
                            x={bx} y={by + 4}
                            fontSize="9" fill={colors.text}
                            fontFamily="monospace" fontWeight="800"
                            textAnchor="middle"
                          >{globalIdx + 1}</text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Page badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 border border-border text-neutral text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold z-20">
                    P.{pageNum}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hover tooltip — full suggestion text, no type chip */}
        {hoveredIdx !== null && resolvedMarkups[hoveredIdx] && (() => {
          const m = resolvedMarkups[hoveredIdx];
          const colors = TYPE_COLORS[m.type] || TYPE_COLORS.error;
          const TOOLTIP_W = 280;
          const containerW = containerRef.current?.clientWidth ?? 600;
          const containerH = containerRef.current?.clientHeight ?? 400;
          const scrollTop = containerRef.current?.scrollTop ?? 0;

          let left = tooltipPos.x + 14;
          if (left + TOOLTIP_W > containerW - 8) left = tooltipPos.x - TOOLTIP_W - 14;

          let top = tooltipPos.y + 10;
          if (top + 180 > containerH + scrollTop) top = tooltipPos.y - 190;

          return (
            <div className="absolute z-50 pointer-events-none" style={{ left, top, width: TOOLTIP_W }}>
              <div
                className="rounded-sm border p-3 flex flex-col gap-2"
                style={{
                  backgroundColor: "#0d0d0d",
                  borderColor: colors.stroke,
                  boxShadow: `0 6px 32px 0 ${colors.stroke}44`,
                }}
              >
                {/* Quote chip */}
                <div className="text-[9px] font-mono opacity-50 border border-white/10 px-1.5 py-0.5 rounded-sm line-clamp-2" style={{ color: colors.stroke }}>
                  &quot;{resolvedMarkups[hoveredIdx] && annotations.find(a => a.suggestion === m.label)?.quote}&quot;
                </div>

                {/* Suggestion text */}
                <p className="text-xs leading-relaxed break-words text-white/80">
                  {m.label}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend — badge number + type name only */}
      {resolvedMarkups.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 flex-shrink-0 pb-4 justify-center">
          {resolvedMarkups.map((m, i) => {
            const colors = TYPE_COLORS[m.type];
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
                style={{ color: colors.stroke }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span
                  className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center text-[8px] font-black"
                  style={{ backgroundColor: colors.badgeBg, color: colors.text }}
                >{i + 1}</span>
                <span>{colors.legendLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
