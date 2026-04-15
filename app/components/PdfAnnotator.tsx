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
  t: any;
  resumeText: string;
  jobDescription: string;
  lang: string;
  userApiKey: string;
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

export default function PdfAnnotator({ fileUrl, annotations, t, resumeText, jobDescription, lang, userApiKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageRender[]>([]);
  const [loading, setLoading] = useState(true);
  const [userScale, setUserScale] = useState(1.0);
  const [resolvedMarkups, setResolvedMarkups] = useState<ResolvedMarkup[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [fixedTexts, setFixedTexts] = useState<Record<number, string>>({});
  const [isFixing, setIsFixing] = useState<number | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

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

  const handleMagicFix = async (idx: number, quote: string) => {
    setIsFixing(idx);
    try {
      const res = await fetch("/api/magic-fix", {
        method: "POST",
        body: JSON.stringify({
          quote,
          resumeText: resumeText,
          jobDescription: jobDescription,
          lang: lang,
          userApiKey: userApiKey
        })
      });
      const data = await res.json();
      if (data.fixed) {
        setFixedTexts(prev => ({ ...prev, [idx]: data.fixed }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFixing(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border border-border bg-surface px-4 py-2 rounded-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-widest text-neutral font-bold">
            {pages.length > 0
              ? `${pages.length} ${t.pages} · ${Math.round(displayScale * 100)}% ${t.zoom}`
              : t.loading}
          </span>
          {pages.length > 0 && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 px-2 py-1 border text-[9px] uppercase font-black tracking-widest transition-all ${showHeatmap ? "bg-accent text-background border-accent" : "border-border text-neutral hover:border-accent hover:text-accent"}`}
            >
              <div className={`w-2 h-2 rounded-full ${showHeatmap ? "bg-background animate-pulse" : "bg-neutral"}`} />
              {showHeatmap ? t.heatmapActive : t.heatmapInactive}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleZoom(-0.1)} className="w-7 h-7 border border-border flex items-center justify-center text-neutral hover:text-accent hover:border-accent transition-colors text-lg font-light">−</button>
          <button onClick={() => handleZoom(0.1)} className="w-7 h-7 border border-border flex items-center justify-center text-neutral hover:text-accent hover:border-accent transition-colors text-lg font-light">+</button>
          <button onClick={() => setUserScale(1.0)} className="px-2 h-7 border border-border text-[10px] uppercase tracking-widest text-neutral hover:text-accent hover:border-accent transition-colors font-bold">{t.reset}</button>
        </div>
      </div>

      {/* Document Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black/40 relative h-full"
        onMouseLeave={() => { if (!activeIdx) setHoveredIdx(null); }}
        onClick={() => setActiveIdx(null)}
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
                            if (activeIdx === null) {
                              setHoveredIdx(globalIdx);
                              const rect = containerRef.current!.getBoundingClientRect();
                              setTooltipPos({
                                x: e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0),
                                y: e.clientY - rect.top + (containerRef.current?.scrollTop ?? 0),
                              });
                            }
                          }}
                          onMouseMove={(e) => {
                            if (activeIdx === null) {
                              const rect = containerRef.current!.getBoundingClientRect();
                              setTooltipPos({
                                x: e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0),
                                y: e.clientY - rect.top + (containerRef.current?.scrollTop ?? 0),
                              });
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveIdx(globalIdx === activeIdx ? null : globalIdx);
                          }}
                          onMouseLeave={() => { if (activeIdx === null) setHoveredIdx(null); }}
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

                  {/* Content-Aware Heatmap Overlay */}
                  {showHeatmap && (
                    <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-multiply transition-opacity duration-500 overflow-hidden">
                      <div className="absolute inset-0" style={{
                        background: [
                          // 1. Subtle F-Pattern Baseline (Human Psychology)
                          `radial-gradient(circle at 15% 10%, rgba(255, 77, 77, 0.3) 0%, transparent 25%)`,
                          `radial-gradient(circle at 12% 40%, rgba(255, 140, 26, 0.2) 0%, transparent 20%)`,
                          `radial-gradient(circle at 10% 80%, rgba(255, 214, 51, 0.1) 0%, transparent 20%)`,

                          // 2. Dynamic Content Peaks (Actual CV Data found by AI)
                          ...pageMarkups.map(m => {
                            const cx = ((m.x + m.w / 2) / naturalWidth) * 100;
                            const cy = ((m.y + m.h / 2) / naturalHeight) * 100;
                            // Strengths (ok) are the hottest points
                            const color = m.type === 'ok' 
                              ? 'rgba(255, 77, 77, 1)' 
                              : (m.type === 'warning' ? 'rgba(255, 140, 26, 0.8)' : 'rgba(255, 214, 51, 0.5)');
                            const size = m.type === 'ok' ? '25%' : '18%';
                            return `radial-gradient(circle at ${cx.toFixed(1)}% ${cy.toFixed(1)}%, ${color} 0%, transparent ${size})`;
                          })
                        ].join(', ')
                      }} />
                    </div>
                  )}

                  {/* Page badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 border border-border text-neutral text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold z-20">
                    P.{pageNum}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hover/Active tooltip */}
        {(hoveredIdx !== null || activeIdx !== null) && (() => {
          const shownIdx = activeIdx !== null ? activeIdx : hoveredIdx;
          if (shownIdx === null) return null;
          
          const m = resolvedMarkups[shownIdx];
          const colors = TYPE_COLORS[m.type] || TYPE_COLORS.error;
          const TOOLTIP_W = 320;
          const containerW = containerRef.current?.clientWidth ?? 600;
          const containerH = containerRef.current?.clientHeight ?? 400;
          const scrollTop = containerRef.current?.scrollTop ?? 0;

          let left = tooltipPos.x + 14;
          if (left + TOOLTIP_W > containerW - 8) left = tooltipPos.x - TOOLTIP_W - 14;

          let top = tooltipPos.y + 10;
          if (top + 180 > containerH + scrollTop) top = tooltipPos.y - 190;

          const quote = annotations.find((a: any) => a.suggestion === m.label)?.quote || "";
          const hasFixed = fixedTexts[shownIdx];

          return (
            <div 
              className={`absolute z-50 ${activeIdx !== null ? 'pointer-events-auto' : 'pointer-events-none'}`} 
              style={{ left, top, width: TOOLTIP_W }}
            >
              <div
                className="rounded-sm border p-4 flex flex-col gap-3"
                style={{
                  backgroundColor: "#0d0d0d",
                  borderColor: colors.stroke,
                  boxShadow: `0 12px 48px 0 rgba(0,0,0,0.8), 0 0 20px 0 ${colors.stroke}44`,
                }}
              >
                {/* Quote chip */}
                <div className="text-[9px] font-mono opacity-50 border border-white/10 px-1.5 py-1 rounded-sm line-clamp-2" style={{ color: colors.stroke }}>
                  &quot;{quote}&quot;
                </div>

                {/* Suggestion text */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral">{t.optimizationHint}</span>
                    {activeIdx === null && <span className="text-[8px] text-accent animate-pulse">{t.clickToFix}</span>}
                  </div>
                  <p className="text-xs leading-relaxed text-white/90">
                    {m.label}
                  </p>
                </div>

                {/* Magic Fix Section */}
                {activeIdx !== null && (
                  <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-3 animate-entry">
                    {!hasFixed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMagicFix(shownIdx, quote);
                        }}
                        disabled={isFixing === shownIdx}
                        className="w-full py-2 bg-accent text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        {isFixing === shownIdx ? (
                          <><span className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" /> {t.magicFixWorking}</>
                        ) : (
                          <>{t.magicFixBtn}</>
                        )}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-sm border border-accent/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-accent uppercase tracking-widest">{t.optimizedVersion}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(hasFixed);
                            }}
                            className="text-accent text-[8px] font-black hover:underline"
                          >
                            {t.copyText}
                          </button>
                        </div>
                        <p className="text-xs italic text-accent leading-relaxed font-light">
                          {hasFixed}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeIdx !== null && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx(null);
                    }}
                    className="mt-1 text-[9px] text-neutral hover:text-white uppercase tracking-tighter self-center"
                  >
                    {t.close}
                  </button>
                )}
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
            const legendLabel = m.type === 'error' ? t.typeCritical : (m.type === 'ok' ? t.typeStrength : t.typeSuggestion);
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
                <span>{legendLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
