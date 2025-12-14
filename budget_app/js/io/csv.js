// scripts/io/csv.js
// CSV import/export + filename helpers (used by exports.js)
//
// Notes:
// - This module intentionally calls dynamic "regenerate*" functions via global scope
//   (window.*) so it does not create circular dependencies with your UI modules.
// - If you convert regenerate* functions to ES module exports, just attach them to
//   window in main.js (e.g., window.regenerateHeadliners = regenerateHeadliners).

import { CSV_META, FIELDS, CSV_ALIASES, CSV_FIELD_BY_LABEL } from "../fields.js";

/* ============================================================
   FILENAME HELPERS
============================================================ */

export function safeFileName(str) {
  return (str || "")
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "") // illegal filename chars
    .replace(/\s+/g, "_")
    .slice(0, 80) || "budget_export";
}

export function getExportBaseName() {
  const titleRaw = (document.getElementById("showTitle")?.value || "UNTITLED_EVENT").trim();
  const dateRaw  = (document.getElementById("showDate")?.value  || "NO_DATE").trim();

  // budget + show name + date
  return safeFileName(`budget_${titleRaw}_${dateRaw}`);
}

export function buildCsvFileName() {
  return `${getExportBaseName()}.csv`;
}

export function buildTxtFileName() {
  return `${getExportBaseName()}.txt`;
}

export function buildChartsPngFileName() {
  return `${getExportBaseName()}_charts.png`;
}

/* ============================================================
   CSV EXPORT
============================================================ */

export function downloadCSV() {
  const rows = [];

  const csvCell = (v) => {
    const s = (v == null) ? "" : String(v);
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const pushKV = (label, value) => rows.push(`${label},${csvCell(value)}`);
  const pushField = (field) => pushKV(field.csv, document.getElementById(field.id)?.value || "");

  // CSV VERSION HEADER (e.g., XODIA_BUDGET_VERSION,3)
  pushKV(CSV_META.key, CSV_META.version);
  rows.push("");

  // BASIC INFO
  pushField(FIELDS.basic.showTitle);
  pushField(FIELDS.basic.showDate);
  rows.push("");

  // HEADLINERS
  rows.push("Headliners:");
  const numHeadliners = +document.getElementById("numHeadliners")?.value || 0;
  for (let i = 1; i <= numHeadliners; i++) {
    pushKV(`Headliner ${i} Fee`,   document.getElementById(`headliner_fee_${i}`)?.value || "");
    pushKV(`Headliner ${i} Hotel`, document.getElementById(`headliner_hotel_${i}`)?.value || "");
    pushKV(`Headliner ${i} Rider`, document.getElementById(`headliner_rider_${i}`)?.value || "");
    pushKV(`Headliner ${i} Name`,  document.getElementById(`headliner_name_${i}`)?.value || "");
  }
  rows.push("");

  // SUPPORT
  rows.push("Support:");
  pushKV("Direct Support Fee", document.getElementById("directSupport")?.value || "");
  const numLocalDJs = +document.getElementById("numLocalDJs")?.value || 0;
  for (let i = 1; i <= numLocalDJs; i++) {
    pushKV(`Local DJ ${i} Name`, document.getElementById(`localDJ_name_${i}`)?.value || "");
    pushKV(`Local DJ ${i} Fee`,  document.getElementById(`localDJ_fee_${i}`)?.value || "");
  }
  rows.push("");

  // PRODUCTION
  rows.push("Production:");
  pushField(FIELDS.production.vjFee);
  pushField(FIELDS.production.venue);
  pushField(FIELDS.production.ledWall);
  pushField(FIELDS.production.lights);
  pushField(FIELDS.production.lasers);
  rows.push("");

  // GEAR RENTALS
  rows.push("Gear Rentals:");
  const numCDJs = +document.getElementById("numCDJs")?.value || 0;
  for (let i = 1; i <= numCDJs; i++) {
    pushKV(`CDJ ${i} Fee`, document.getElementById(`cdj_fee_${i}`)?.value || "");
  }
  pushField(FIELDS.gear.sound);
  pushField(FIELDS.gear.mixer);
  pushField(FIELDS.gear.table);
  rows.push("");

  // MARKETING
  rows.push("Marketing:");
  pushField(FIELDS.marketing.facebookAdsXodia);
  pushField(FIELDS.marketing.facebookAdsSpaceCampHQ);
  pushField(FIELDS.marketing.instagramAdsXodia);
  pushField(FIELDS.marketing.instagramAdsSpaceCampHQ);
  pushField(FIELDS.marketing.physicalFlyers);
  pushField(FIELDS.marketing.eventbriteAds);
  rows.push("");

  // STAFF
  rows.push("Staff:");
  pushField(FIELDS.staff.doorStaff);
  pushField(FIELDS.staff.merchTable);
  pushField(FIELDS.staff.transportation);

  const numShowRunners = +document.getElementById("numShowRunners")?.value || 0;
  for (let i = 1; i <= numShowRunners; i++) {
    pushKV(`Show Runner ${i} Fee`, document.getElementById(`showRunner_fee_${i}`)?.value || "");
  }
  rows.push("");

  // OTHER CATEGORIES
  rows.push("Other Categories:");
  const numOtherCategories = +document.getElementById("numOtherCategories")?.value || 0;
  for (let c = 1; c <= numOtherCategories; c++) {
    const name  = document.getElementById(`otherCategoryName_${c}`)?.value || "";
    const count = document.getElementById(`otherCategoryCount_${c}`)?.value || 0;

    pushKV(`Category ${c} Name`, name);
    pushKV(`Category ${c} Items Count`, count);

    for (let i = 1; i <= (+count || 0); i++) {
      pushKV(`Category ${c} Item ${i} Name`, document.getElementById(`otherCategory_${c}_itemName_${i}`)?.value || "");
      pushKV(`Category ${c} Item ${i} Fee`,  document.getElementById(`otherCategory_${c}_itemFee_${i}`)?.value  || "");
    }
  }
  rows.push("");

  // SALES
  rows.push("Sales:");
  pushField(FIELDS.sales.eventbriteSales);
  pushField(FIELDS.sales.djPresales);
  pushField(FIELDS.sales.promoTeam);
  pushField(FIELDS.sales.doorSales);
  pushField(FIELDS.sales.merchSold);

  const numMerchVendors = +document.getElementById("numMerchVendors")?.value || 0;
  for (let i = 1; i <= numMerchVendors; i++) {
    pushKV(`Vendor ${i} Name`, document.getElementById(`merchVendor_name_${i}`)?.value || "");
    pushKV(`Vendor ${i} Fee`,  document.getElementById(`merchVendor_fee_${i}`)?.value  || "");
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = buildCsvFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ============================================================
   CSV IMPORT
============================================================ */

export function triggerImport() {
  const input = document.getElementById("csvFileInput");
  if (!input) return;

  // Allows importing the same file twice in a row
  input.value = "";
  input.click();
}

export function initCsvImport() {
  if (window.__xodiaCsvImportInit) return;
  window.__xodiaCsvImportInit = true;

  const input = document.getElementById("csvFileInput");
  if (!input) return;

  input.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    loadCSV(f);
  });
}

export function loadCSV(fileOrText) {
  const resetForm = () => {
    const form = document.getElementById("budgetForm");
    if (form) form.reset();
  };

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = (v == null) ? "" : v;
  };

  const parseLabelValue = (line) => {
    const idx = line.indexOf(",");
    if (idx < 0) return { label: line.trim(), value: "" };

    const label = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/""/g, '"');
    }
    return { label, value };
  };

  const normalizeLabel = (label) => {
    const l = (label || "").trim();
    return (CSV_ALIASES && CSV_ALIASES[l]) ? CSV_ALIASES[l] : l;
  };

  const applyText = (csvText) => {
    if (!csvText || !String(csvText).trim()) {
      alert("CSV is empty.");
      return;
    }

    resetForm();

    const lines = String(csvText).split(/\r?\n/).map(l => l.trim());
    const pairs = [];

    // Helpers to regenerate dynamic sections (use the functions your app actually has)
    const regenVendors = () => {
      if (typeof regenerateVendors === "function") regenerateVendors();
      else if (typeof regenerateMerchVendors === "function") regenerateMerchVendors(); // fallback
    };

    const regenOtherItems = (categoryId) => {
      if (typeof regenerateOtherItems === "function") regenerateOtherItems(categoryId);
      else if (typeof regenerateOtherCategoryItems === "function") regenerateOtherCategoryItems(categoryId); // fallback
    };

    const ensureMerchVendors = (n) => {
      const cur = +document.getElementById("numMerchVendors")?.value || 0;
      if (n > cur) {
        setVal("numMerchVendors", n);
        regenVendors();
      }
    };

    const ensureOtherCategories = (c) => {
      const cur = +document.getElementById("numOtherCategories")?.value || 0;
      if (c > cur) {
        setVal("numOtherCategories", c);
        if (typeof regenerateOtherCategories === "function") regenerateOtherCategories();
      }
    };

    const ensureOtherItemRow = (c, itemIndex) => {
      ensureOtherCategories(c);

      const countId = `otherCategoryCount_${c}`;
      const curCount = +document.getElementById(countId)?.value || 0;

      if (itemIndex > curCount) {
        setVal(countId, itemIndex);
        regenOtherItems(c);
      }
    };

    // PASS 1: detect max counts so we can regenerate dynamic sections first
    let csvVersion = 0;

    let maxHead = 0;
    let maxLocal = 0;
    let maxCDJ = 0;
    let maxRunner = 0;
    let maxVendor = 0;
    let maxOtherCats = 0;

    // Legacy marketing (pre-split) support
    let legacyFbAmount = null;
    let legacyFbAccount = "";
    let legacyIgAmount = null;
    let legacyIgAccount = "";

    for (const line of lines) {
      if (!line) continue;
      if (!line.includes(",")) continue;

      const parsed = parseLabelValue(line);
      let label = normalizeLabel(parsed.label);
      const value = parsed.value;

      // Normalize a couple legacy labels for backwards compatibility
      let m;
      if ((m = label.match(/^Category\s+(\d+)\s+Items$/i))) {
        label = `Category ${m[1]} Items Count`;
      }
      if ((m = label.match(/^Merch Vendor\s+(\d+)\s+(Name|Fee)$/i))) {
        label = `Vendor ${m[1]} ${m[2]}`;
      }

      // Version header line: XODIA_BUDGET_VERSION,3
      if (label === CSV_META.key) {
        const v = parseInt(value, 10);
        csvVersion = Number.isFinite(v) ? v : 0;
        continue;
      }

      if ((m = label.match(/^Headliner\s+(\d+)\b/i)))   maxHead   = Math.max(maxHead, +m[1]);
      if ((m = label.match(/^Local DJ\s+(\d+)\b/i)))    maxLocal  = Math.max(maxLocal, +m[1]);
      if ((m = label.match(/^CDJ\s+(\d+)\b/i)))         maxCDJ    = Math.max(maxCDJ, +m[1]);
      if ((m = label.match(/^Show Runner\s+(\d+)\b/i))) maxRunner = Math.max(maxRunner, +m[1]);
      if ((m = label.match(/^Vendor\s+(\d+)\b/i)))      maxVendor = Math.max(maxVendor, +m[1]);

      // Other categories: detect max category index from *any* of the category-related lines
      if ((m = label.match(/^Category\s+(\d+)\s+Name$/i)))                    maxOtherCats = Math.max(maxOtherCats, +m[1]);
      if ((m = label.match(/^Category\s+(\d+)\s+Items Count$/i)))             maxOtherCats = Math.max(maxOtherCats, +m[1]);
      if ((m = label.match(/^Category\s+(\d+)\s+Item\s+(\d+)\s+(Name|Fee)$/i))) maxOtherCats = Math.max(maxOtherCats, +m[1]);

      // Legacy marketing labels
      if (label === "Facebook Ads")         legacyFbAmount = value;
      if (label === "Facebook Ads Account") legacyFbAccount = value;
      if (label === "Instagram Ads")        legacyIgAmount = value;
      if (label === "Instagram Ads Account") legacyIgAccount = value;

      pairs.push({ label, value });
    }

    if (maxHead > 0) {
      setVal("numHeadliners", maxHead);
      if (typeof regenerateHeadliners === "function") regenerateHeadliners();
    }

    if (maxLocal > 0) {
      setVal("numLocalDJs", maxLocal);
      if (typeof regenerateLocalDJs === "function") regenerateLocalDJs();
    }

    if (maxCDJ > 0) {
      setVal("numCDJs", maxCDJ);
      if (typeof regenerateCDJs === "function") regenerateCDJs();
    }

    if (maxRunner > 0) {
      setVal("numShowRunners", maxRunner);
      if (typeof regenerateShowRunners === "function") regenerateShowRunners();
    }

    if (maxVendor > 0) ensureMerchVendors(maxVendor);

    if (maxOtherCats > 0) {
      setVal("numOtherCategories", maxOtherCats);
      if (typeof regenerateOtherCategories === "function") regenerateOtherCategories();
    }

    // PASS 2: apply values
    let currentCategory = 0; // for legacy CSVs that used Item 1 Name/Fee without category prefix

    for (const { label: rawLabel, value } of pairs) {
      let label = rawLabel;

      // 1) Config-mapped fields (single-input fields)
      const mapped = CSV_FIELD_BY_LABEL?.[label];
      if (mapped && mapped.id) {
        setVal(mapped.id, value);
        continue;
      }

      // 2) Repeaters / special cases
      let m;

      // Direct Support (exported as a labeled line; not part of FIELDS config)
      if (/^Direct Support(\s+Fee)?$/i.test(label)) {
        setVal("directSupport", value);
        continue;
      }

      // Headliners
      if ((m = label.match(/^Headliner\s+(\d+)\s+Fee$/i)))   { setVal(`headliner_fee_${m[1]}`, value); continue; }
      if ((m = label.match(/^Headliner\s+(\d+)\s+Hotel$/i))) { setVal(`headliner_hotel_${m[1]}`, value); continue; }
      if ((m = label.match(/^Headliner\s+(\d+)\s+Rider$/i))) { setVal(`headliner_rider_${m[1]}`, value); continue; }
      if ((m = label.match(/^Headliner\s+(\d+)\s+Name$/i)))  { setVal(`headliner_name_${m[1]}`, value); continue; }

      // Local DJs
      if ((m = label.match(/^Local DJ\s+(\d+)\s+Name$/i))) { setVal(`localDJ_name_${m[1]}`, value); continue; }
      if ((m = label.match(/^Local DJ\s+(\d+)\s+Fee$/i)))  { setVal(`localDJ_fee_${m[1]}`, value); continue; }

      // CDJs
      if ((m = label.match(/^CDJ\s+(\d+)\s+Fee$/i))) { setVal(`cdj_fee_${m[1]}`, value); continue; }

      // Show runners
      if ((m = label.match(/^Show Runner\s+(\d+)\s+Fee$/i))) { setVal(`showRunner_fee_${m[1]}`, value); continue; }

      // ---- OTHER CATEGORIES (versioned format) ----
      if ((m = label.match(/^Category\s+(\d+)\s+Name$/i))) {
        const c = +m[1];
        currentCategory = c;
        ensureOtherCategories(c);
        setVal(`otherCategoryName_${c}`, value);
        continue;
      }

      if ((m = label.match(/^Category\s+(\d+)\s+Items Count$/i))) {
        const c = +m[1];
        currentCategory = c;
        ensureOtherCategories(c);
        setVal(`otherCategoryCount_${c}`, value);
        regenOtherItems(c);
        continue;
      }

      if ((m = label.match(/^Category\s+(\d+)\s+Item\s+(\d+)\s+Name$/i))) {
        const c = +m[1], i = +m[2];
        ensureOtherItemRow(c, i);
        setVal(`otherCategory_${c}_itemName_${i}`, value);
        continue;
      }

      if ((m = label.match(/^Category\s+(\d+)\s+Item\s+(\d+)\s+Fee$/i))) {
        const c = +m[1], i = +m[2];
        ensureOtherItemRow(c, i);
        setVal(`otherCategory_${c}_itemFee_${i}`, value);
        continue;
      }

      // ---- OTHER CATEGORIES (legacy format) ----
      if ((m = label.match(/^Category\s+(\d+)\s+Items$/i))) {
        // if a legacy file slips through without normalization
        const c = +m[1];
        currentCategory = c;
        ensureOtherCategories(c);
        setVal(`otherCategoryCount_${c}`, value);
        regenOtherItems(c);
        continue;
      }

      if ((m = label.match(/^Item\s+(\d+)\s+Name$/i))) {
        const i = +m[1];
        const c = currentCategory || 1;
        ensureOtherItemRow(c, i);
        setVal(`otherCategory_${c}_itemName_${i}`, value);
        continue;
      }

      if ((m = label.match(/^Item\s+(\d+)\s+Fee$/i))) {
        const i = +m[1];
        const c = currentCategory || 1;
        ensureOtherItemRow(c, i);
        setVal(`otherCategory_${c}_itemFee_${i}`, value);
        continue;
      }

      // ---- MERCH VENDORS ----
      if ((m = label.match(/^Vendor\s+(\d+)\s+Name$/i))) {
        const i = +m[1];
        ensureMerchVendors(i);
        setVal(`merchVendor_name_${i}`, value);
        continue;
      }

      if ((m = label.match(/^Vendor\s+(\d+)\s+Fee$/i))) {
        const i = +m[1];
        ensureMerchVendors(i);
        setVal(`merchVendor_fee_${i}`, value);
        continue;
      }
    }

    // Legacy marketing fallback
    if (legacyFbAmount != null && !document.getElementById("facebookAdsXodia")?.value) {
      const acct = (legacyFbAccount || "").trim().toUpperCase();
      if (acct === "SPACE CAMP HQ") setVal("facebookAdsSpaceCampHQ", legacyFbAmount);
      else setVal("facebookAdsXodia", legacyFbAmount);
    }

    if (legacyIgAmount != null && !document.getElementById("instagramAdsXodia")?.value) {
      const acct = (legacyIgAccount || "").trim().toUpperCase();
      if (acct === "SPACE CAMP HQ") setVal("instagramAdsSpaceCampHQ", legacyIgAmount);
      else setVal("instagramAdsXodia", legacyIgAmount);
    }

    if (typeof updateBudget === "function") updateBudget();
  };

  if (fileOrText instanceof File) {
    const reader = new FileReader();
    reader.onload = () => applyText(reader.result);
    reader.readAsText(fileOrText);
    return;
  }

  applyText(fileOrText);
}

// Optional convenience: expose for HTML onclick="..." usage
if (typeof window !== "undefined") {
  window.downloadCSV = downloadCSV;
  window.triggerImport = triggerImport;
  window.loadCSV = loadCSV;
  window.initCsvImport = initCsvImport;
}
