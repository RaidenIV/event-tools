// scripts/io/exports.js
// Text + chart export utilities (copy, TXT, PNG, "Download All")

import { downloadCSV, buildTxtFileName, buildChartsPngFileName, safeFileName } from "./csv.js";

/* ============================================================
   TEXT PREVIEW EXPORTS
============================================================ */

export function getPreviewText() {
  const el = document.getElementById("textPreview");
  return el ? (el.textContent || "") : "";
}

export async function copyTextPreview() {
  const text = getPreviewText();
  const status = document.getElementById("copyStatus");

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    if (status) {
      status.textContent = "Copied!";
      setTimeout(() => (status.textContent = ""), 1500);
    }
  } catch (err) {
    console.error(err);
    if (status) {
      status.textContent = "Copy failed.";
      setTimeout(() => (status.textContent = ""), 2000);
    } else {
      alert("Copy failed.");
    }
  }
}

export function exportTextPreviewTxt(filename) {
  const text = getPreviewText();
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename || buildTxtFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ============================================================
   CHARTS PNG EXPORT (combine expenses + sales into one image)
============================================================ */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function downloadChartsPNG(filename) {
  const chartExpenses = window.chartExpenses;
  const chartSales = window.chartSales;

  if (!chartExpenses || !chartSales || !chartExpenses.canvas || !chartSales.canvas) {
    alert("Charts not found. Click Update Chart first.");
    return;
  }

  // Try to force a final render before capture
  try {
    chartExpenses.update("none");
    chartSales.update("none");
  } catch (e) {
    // ignore
  }

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const expURL = (typeof chartExpenses.toBase64Image === "function")
    ? chartExpenses.toBase64Image()
    : chartExpenses.canvas.toDataURL("image/png");

  const salesURL = (typeof chartSales.toBase64Image === "function")
    ? chartSales.toBase64Image()
    : chartSales.canvas.toDataURL("image/png");

  const [expImg, salesImg] = await Promise.all([loadImage(expURL), loadImage(salesURL)]);

  // Optional: auto filename from Show Title / Date if not provided
  if (!filename) filename = buildChartsPngFileName();

  const pad = 24;
  const gap = 24;

  const outW = Math.max(expImg.width, salesImg.width) + pad * 2;
  const outH = expImg.height + salesImg.height + pad * 2 + gap;

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;

  const ctx = out.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);

  // Draw expenses (centered)
  let y = pad;
  ctx.drawImage(expImg, (outW - expImg.width) / 2, y);

  // Draw sales beneath
  y += expImg.height + gap;
  ctx.drawImage(salesImg, (outW - salesImg.width) / 2, y);

  out.toBlob((blob) => {
    if (!blob) {
      const a = document.createElement("a");
      a.href = out.toDataURL("image/png");
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}

/* ============================================================
   DOWNLOAD ALL
============================================================ */

export function downloadAll() {
  // Note: some browsers may prompt to allow multiple downloads.
  if (typeof updateBudget === "function") updateBudget();

  downloadCSV();
  exportTextPreviewTxt();

  // Small delay helps ensure the canvases are fully painted before capture
  setTimeout(() => {
    downloadChartsPNG();
  }, 150);
}

// Optional convenience: expose for HTML onclick="..." usage
if (typeof window !== "undefined") {
  window.copyTextPreview = copyTextPreview;
  window.exportTextPreviewTxt = exportTextPreviewTxt;
  window.downloadChartsPNG = downloadChartsPNG;
  window.downloadAll = downloadAll;
  window.getPreviewText = getPreviewText;
}
