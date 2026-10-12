// Browser adapter for the MIT baoyu-design exporter. Reuses the unmodified
// capture/render/media/timing modules; no Node driver or extra browser runtime.
import PptxGenJS from "../skills/baoyu-design/agents/gen-pptx/vendor/pptxgenjs/src/pptxgen.ts";
import { buildMediaCache } from "../skills/baoyu-design/agents/gen-pptx/src/render/media-cache.ts";
import { renderNodeToPptx } from "../skills/baoyu-design/agents/gen-pptx/src/render/render-node.ts";
import { buildTimingXml } from "../skills/baoyu-design/agents/gen-pptx/src/render/timing.ts";
import { parseColor } from "../skills/baoyu-design/agents/gen-pptx/src/core/color.ts";
import { pxToInches } from "../skills/baoyu-design/agents/gen-pptx/src/core/units.ts";
import type { CapturedSlide, MediaRef, ResolvedMedia } from "../skills/baoyu-design/agents/gen-pptx/src/types.ts";
import type { PptxSlide, SlideAnimEntry } from "../skills/baoyu-design/agents/gen-pptx/src/render/context.ts";

export async function createPresentation(
  width: number, height: number, slides: CapturedSlide[],
  resolveMedia: (refs: MediaRef[]) => Promise<ResolvedMedia[]>,
) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new Error("Slide dimensions must be positive numbers.");
  if (!slides.length) throw new Error("The deck has no slides.");
  const pptx = new PptxGenJS();
  pptx.author = "Open Slides";
  pptx.defineLayout({ name: "OPEN", width: pxToInches(width), height: pxToInches(height) });
  pptx.layout = "OPEN";
  const warnings: string[] = [];
  const cache = await buildMediaCache(slides, warnings, resolveMedia);
  for (const [i, captured] of slides.entries()) {
    const slide = pptx.addSlide() as unknown as PptxSlide;
    const root = structuredClone(captured.root);
    const bg = parseColor(root.style.backgroundColor);
    if (bg && bg.alpha === 1) {
      slide.background = { color: bg.hex };
      root.style.backgroundColor = "transparent";
    }
    const entries: SlideAnimEntry[] = [];
    renderNodeToPptx(root, { slide, slideW: width, slideH: height,
      originX: captured.rect.x, originY: captured.rect.y,
      mediaCache: cache, warnings, slideNo: i + 1, animEntries: entries });
    if (captured.notes?.trim()) slide.addNotes(captured.notes);
    const live = entries.filter(entry => entry.spids.length);
    if (live.length) slide._timingXml = buildTimingXml(
      live.map(entry => ({ def: entry.def, spids: entry.spids })), width, height);
    if (entries.length !== live.length) warnings.push(`Slide ${i + 1}: an animation had no exported objects.`);
  }
  return { pptx, warnings };
}
