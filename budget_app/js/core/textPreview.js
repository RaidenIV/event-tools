// js/core/textPreview.js
// Builds the text preview panel

export function updateTextPreview(data = {}) {
  const preview = document.getElementById("textPreview");
  if (!preview) return;

  const fmtMoney = (v) => {
    const n = Number(v) || 0;
    return `$${n.toFixed(2)}`;
  };

  const gNum = (id) => {
    const el = document.getElementById(id);
    const v = el ? parseFloat(el.value) : 0;
    return Number.isFinite(v) ? v : 0;
  };

  const gStr = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value || "") : "";
  };

  const sectionTotal = (rows) =>
    (rows || []).reduce((sum, r) => sum + (r && typeof r.value === "number" ? (+r.value || 0) : 0), 0);

  /* ============================================================
     ALIGNMENT FIX (MIN LABEL COL + FIXED MONEY COL)
  ============================================================ */
  const MIN_LABEL_COL = 32;  // <-- increase if you want more spacing before $
  const MONEY_COL = 12;      // "$0.00" fits (increase to 14 for "$12,345.67")

  let labelWidth = MIN_LABEL_COL;
  const consider = (s) => { labelWidth = Math.max(labelWidth, String(s || "").length); };
  /* ============================================================ */

  const showTitle = (gStr("showTitle") || "UNTITLED EVENT").toUpperCase();
  const showDateText = gStr("showDate");

  // Build detailed expense sections
  const sections = [];

  // HEADLINERS (detailed)
  const headlinerRows = [];
  const nHead = +document.getElementById("numHeadliners")?.value || 0;
  for (let i = 1; i <= nHead; i++) {
    const name = gStr(`headliner_name_${i}`) || `Headliner ${i}`;
    headlinerRows.push({ label: `${name} Fee:`, value: gNum(`headliner_fee_${i}`) });
    headlinerRows.push({ label: `${name} Hotel:`, value: gNum(`headliner_hotel_${i}`) });
    headlinerRows.push({ label: `${name} Rider:`, value: gNum(`headliner_rider_${i}`) });
  }
  if (headlinerRows.length) sections.push({ title: "Headliners", rows: headlinerRows });

  // SUPPORT
  const supportRows = [
    { label: "Direct Support:", value: gNum("directSupport") }
  ];

  const nLocal = +document.getElementById("numLocalDJs")?.value || 0;
  for (let i = 1; i <= nLocal; i++) {
    const name = gStr(`localDJ_name_${i}`) || `Local DJ ${i}`;
    supportRows.push({ label: `${name} Fee:`, value: gNum(`localDJ_fee_${i}`) });
  }
  sections.push({ title: "Support", rows: supportRows });

  // PRODUCTION
  const productionRows = [
    { label: "VJ Fee:", value: gNum("vjFee") },
    { label: "Venue:", value: gNum("venue") },
    { label: "LED Wall:", value: gNum("ledWall") },
    { label: "Lights:", value: gNum("lights") },
    { label: "Lasers:", value: gNum("lasers") }
  ];
  sections.push({ title: "Production", rows: productionRows });

  // GEAR RENTALS
  const gearRows = [];
  const nCDJ = +document.getElementById("numCDJs")?.value || 0;
  for (let i = 1; i <= nCDJ; i++) gearRows.push({ label: `CDJ ${i}:`, value: gNum(`cdj_fee_${i}`) });
  gearRows.push({ label: "Mixer:", value: gNum("mixer") });
  gearRows.push({ label: "Sound:", value: gNum("sound") });
  gearRows.push({ label: "Table:", value: gNum("table") });
  sections.push({ title: "Gear Rentals", rows: gearRows });

  // MARKETING (split inputs)
  const hasFbSplit =
    !!document.getElementById("facebookAdsXodia") ||
    !!document.getElementById("facebookAdsSpaceCampHQ");

  const hasIgSplit =
    !!document.getElementById("instagramAdsXodia") ||
    !!document.getElementById("instagramAdsSpaceCampHQ");

  const fbX = hasFbSplit ? gNum("facebookAdsXodia") : gNum("facebookAds"); // legacy => XODIA
  const fbS = hasFbSplit ? gNum("facebookAdsSpaceCampHQ") : 0;

  const igX = hasIgSplit ? gNum("instagramAdsXodia") : gNum("instagramAds"); // legacy => XODIA
  const igS = hasIgSplit ? gNum("instagramAdsSpaceCampHQ") : 0;

  const marketingRows = [
    { type: "heading", text: "Facebook Ads" },
    { label: "XODIA:", value: fbX },
    { label: "SPACE CAMP HQ:", value: fbS },
    { type: "blank" },

    { type: "heading", text: "Instagram Ads" },
    { label: "XODIA:", value: igX },
    { label: "SPACE CAMP HQ:", value: igS },
    { type: "blank" }, // <-- ADD THIS (empty line after Instagram Ads)

    { label: "Physical Flyers:", value: gNum("physicalFlyers") },
    { label: "Eventbrite Ads:", value: gNum("eventbriteAds") },
  ];
  sections.push({ title: "Marketing", rows: marketingRows });

  // STAFF
  const staffRows = [
    { label: "Door Staff:", value: gNum("doorStaff") },
    { label: "Merch Table:", value: gNum("merchTable") },
    { label: "Transportation:", value: gNum("transportation") },
  ];
  const nRunners = +document.getElementById("numShowRunners")?.value || 0;
  for (let i = 1; i <= nRunners; i++) staffRows.push({ label: `Show Runner ${i}:`, value: gNum(`showRunner_fee_${i}`) });
  sections.push({ title: "Staff", rows: staffRows });

  // OTHER CATEGORIES
  const otherRows = [];
  const nOtherCats = +document.getElementById("numOtherCategories")?.value || 0;
  for (let c = 1; c <= nOtherCats; c++) {
    const catName = gStr(`otherCategoryName_${c}`) || `Category ${c}`;
    const count = +document.getElementById(`otherCategoryCount_${c}`)?.value || 0;

    otherRows.push({ type: "heading", text: catName });
    for (let i = 1; i <= count; i++) {
      const itemName = gStr(`otherCategory_${c}_itemName_${i}`) || `Item ${i}`;
      otherRows.push({ label: `${itemName}:`, value: gNum(`otherCategory_${c}_itemFee_${i}`) });
    }
    otherRows.push({ type: "blank" });
  }
  if (otherRows.length) sections.push({ title: "Other", rows: otherRows });

  // Determine alignment width (now respects MIN_LABEL_COL)
  sections.forEach(sec => {
    consider(sec.title);
    (sec.rows || []).forEach(r => {
      if (r?.type === "text" || r?.type === "heading" || r?.type === "blank") return;
      consider(r.label || "");
    });
  });

  const fmtRow = (label, value) => {
    const left = String(label || "").padEnd(labelWidth, " ");
    const money = fmtMoney(value).padStart(MONEY_COL, " ");
    return `${left}  ${money}`;
  };

  const lines = [];

  lines.push(`EVENT: ${showTitle}${showDateText ? `  |  DATE: ${showDateText}` : ""}`);
  lines.push("");

  lines.push("EXPENSES");
  lines.push("--------------------------------");

  let totalExpenses = 0;

  for (const sec of sections) {
    if (!sec?.rows?.length) continue;

    lines.push(sec.title.toUpperCase());

    for (const r of sec.rows) {
      if (r?.type === "blank") { lines.push(""); continue; }
      if (r?.type === "heading") { lines.push(String(r.text || "")); continue; }
      if (r?.type === "text") { lines.push(`  ${r.text}`); continue; }
      lines.push(fmtRow(r.label, r.value));
    }

    const secTotal = sectionTotal(sec.rows);
    totalExpenses += secTotal;

    lines.push(fmtRow(`TOTAL ${sec.title.toUpperCase()}:`, secTotal));
    lines.push("");
  }

  lines.push("--------------------------------");
  lines.push(fmtRow("TOTAL EXPENSES:", totalExpenses));
  lines.push("");

  // REVENUE
  const merchVendorTotal = (() => {
    const n = +document.getElementById("numMerchVendors")?.value || 0;
    let t = 0;
    for (let i = 1; i <= n; i++) t += gNum(`merchVendor_fee_${i}`);
    return t;
  })();

  const revenueRows = [
    { label: "Eventbrite Sales:", value: gNum("eventbriteSales") },
    { label: "DJ Presales:", value: gNum("djPresales") },
    { label: "Promo Team:", value: gNum("promoTeam") },
    { label: "Door Sales:", value: gNum("doorSales") },
    { label: "Merch Sold:", value: gNum("merchSold") },
    { label: "Merch Vendors:", value: merchVendorTotal },
  ];

  // Make revenue labels count toward alignment too
  revenueRows.forEach(r => consider(r.label || ""));

  const totalRevenue = sectionTotal(revenueRows);

  lines.push("REVENUE");
  lines.push("--------------------------------");
  revenueRows.forEach(r => lines.push(fmtRow(r.label, r.value)));
  lines.push("--------------------------------");
  lines.push(fmtRow("TOTAL REVENUE:", totalRevenue));
  lines.push("");

  lines.push("NET PROFIT");
  lines.push("--------------------------------");
  const netProfit = Number.isFinite(+data.netProfit) ? +data.netProfit : (totalRevenue - totalExpenses);
  lines.push(`${netProfit >= 0 ? "+" : "-"}$${Math.abs(netProfit).toFixed(2)}`);

  preview.textContent = lines.join("\n");
}
