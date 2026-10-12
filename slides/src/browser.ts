import { captureEditable } from "../skills/baoyu-design/agents/gen-pptx/src/browser/capture-editable.ts";
import { resolveMedia } from "../skills/baoyu-design/agents/gen-pptx/src/browser/media-browser.ts";
import type { CapturedSlide } from "../skills/baoyu-design/agents/gen-pptx/src/types.ts";
import { createPresentation } from "./presentation.ts";

type Stage = HTMLElement & { index: number; goTo(index: number): void;
  designWidth: number; designHeight: number };

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function exportDeck(stage: Stage) {
  const previous = stage.index;
  const previousNoscale = stage.getAttribute("noscale");
  const slides = Array.from(stage.children).filter(el =>
    el.matches("section") && !el.hasAttribute("data-deck-skip"));
  const allSlides = Array.from(stage.children).filter(el => el.matches("section"));
  const captures: CapturedSlide[] = [];
  const warnings: string[] = [];
  stage.setAttribute("noscale", "");
  try {
    await document.fonts.ready;
    for (const slide of slides) {
      stage.goTo(allSlides.indexOf(slide));
      const captured = await captureEditable({ selector: "deck-stage > section[data-deck-active]", delay: 50 }, []);
      if (captured.imagesFailed) warnings.push(`${captured.imagesFailed} images could not be loaded.`);
      warnings.push(...captured.animWarnings, ...captured.animNested);
      captures.push({ ...captured.slide, notes: slide.getAttribute("data-notes") || "" });
    }
    const result = await createPresentation(stage.designWidth, stage.designHeight, captures, resolveMedia);
    const blob = await result.pptx.write({ outputType: "blob", compression: true }) as Blob;
    return { blob, slides: captures.length, warnings: [...warnings, ...result.warnings] };
  } finally {
    if (previousNoscale === null) stage.removeAttribute("noscale");
    else stage.setAttribute("noscale", previousNoscale);
    stage.goTo(previous);
  }
}

async function mount() {
  await customElements.whenDefined("deck-stage");
  const stage = document.querySelector("deck-stage") as Stage;
  const toolbar = document.querySelector("[data-open-controls]");
  if (!stage || !toolbar) return;
  const status = toolbar.querySelector("[role=status]")!;
  const exportButton = toolbar.querySelector("[data-export]") as HTMLButtonElement;
  const editButton = toolbar.querySelector("[data-edit]") as HTMLButtonElement;
  let busy = false;
  window.addEventListener("keydown", e => { if (busy) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  editButton.addEventListener("click", () => {
    const editing = editButton.getAttribute("aria-pressed") !== "true";
    stage.querySelectorAll<HTMLElement>("h1,h2,h3,p,li").forEach(el => {
      if (editing) el.setAttribute("contenteditable", "true");
      else el.removeAttribute("contenteditable");
    });
    editButton.setAttribute("aria-pressed", String(editing));
    status.textContent = editing ? "Click text to edit. Save HTML to keep changes." : "Presentation mode";
  });
  exportButton.addEventListener("click", async () => {
    if (busy) return;
    busy = true; exportButton.disabled = true;
    stage.inert = true;
    status.textContent = "Exporting in this browser…";
    try {
      const result = await exportDeck(stage);
      download(result.blob, "open-slides.pptx");
      status.textContent = `Exported ${result.slides} slides${result.warnings.length ? `; ${result.warnings.length} warnings (see console)` : ""}.`;
      if (result.warnings.length) console.warn("Open Slides export warnings", result.warnings);
    } catch (error) {
      status.textContent = `Export failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally { busy = false; exportButton.disabled = false; stage.inert = false; }
  });
  toolbar.querySelector("[data-save]")!.addEventListener("click", () => {
    const html = "<!doctype html>\n" + document.documentElement.outerHTML;
    download(new Blob([html], { type: "text/html;charset=utf-8" }), "open-slides.html");
    status.textContent = "Saved HTML includes your edits and browser exporter.";
  });
  toolbar.querySelector("[data-print]")!.addEventListener("click", () => window.print());
}
void mount();
