/* ============================================================
   COLLAPSIBLE CONTROLLER (C-3 + SC-2 + Arrow A + JS-A)
============================================================ */
const otherCategoryState = {};

const collapsibleSections = [
    { header: "header_headliners", body: "section_headliners" },
    { header: "header_support", body: "section_support" },
    { header: "header_production", body: "section_production" },
    { header: "header_gear", body: "section_gear" },
    { header: "header_marketing", body: "section_marketing" },
    { header: "header_staff", body: "section_staff" },
    { header: "header_otherCats", body: "section_otherCats" }
];

/* Initialize all collapsibles: SC-2 (expanded by default) */
function initCollapsibles() {
    collapsibleSections.forEach(sec => {
        const header = document.getElementById(sec.header);
        const body = document.getElementById(sec.body);

        if (!header || !body) return;

        // Expanded state
        header.dataset.open = "true";
        header.textContent = "▾ " + header.dataset.label;

        body.style.display = "block";

        header.addEventListener("click", () => toggleSection(sec.header, sec.body));
    });
}

/* Toggle handler */
function toggleSection(headerID, bodyID) {
    const header = document.getElementById(headerID);
    const body = document.getElementById(bodyID);

    if (!header || !body) return;

    const isOpen = header.dataset.open === "true";

    if (isOpen) {
        header.dataset.open = "false";
        header.textContent = "▸ " + header.dataset.label;
        body.style.display = "none";
    } else {
        header.dataset.open = "true";
        header.textContent = "▾ " + header.dataset.label;
        body.style.display = "block";
    }
}

/* Auto-expand sections that receive values (C-3) */
function autoExpand(sectionID, headerID) {
    const header = document.getElementById(headerID);
    const body = document.getElementById(sectionID);

    if (header && body) {
        header.dataset.open = "true";
        header.textContent = "▾ " + header.dataset.label;
        body.style.display = "block";
    }
}

/* ============================================================
   FIELD CONFIG + CSV VERSIONING
   - Add new fields here once, then CSV import/export can stay in sync.
============================================================ */

const CSV_META = {
  key: "XODIA_BUDGET_VERSION",
  version: 3
};

// Single-input fields only (repeaters handled separately)
const FIELDS = {
  basic: {
    showTitle: { id: "showTitle", label: "Show Title", csv: "Show Title" },
    showDate:  { id: "showDate",  label: "Show Date",  csv: "Show Date" }
  },

  production: {
    vjFee:   { id: "vjFee",   label: "VJ Fee",   csv: "VJ Fee" },
    venue:   { id: "venue",   label: "Venue",    csv: "Venue" },
    ledWall: { id: "ledWall", label: "LED Wall", csv: "LED Wall" },
    lights:  { id: "lights",  label: "Lights",   csv: "Lights" },
    lasers:  { id: "lasers",  label: "Lasers",   csv: "Lasers" }
  },

  gear: {
    sound: { id: "sound", label: "Sound", csv: "Sound" },
    mixer: { id: "mixer", label: "Mixer", csv: "Mixer" },
    table: { id: "table", label: "Table", csv: "Table" }
  },

  marketing: {
    facebookAdsXodia:       { id: "facebookAdsXodia",       label: "Facebook Ads (XODIA)",         csv: "Facebook Ads XODIA" },
    facebookAdsSpaceCampHQ: { id: "facebookAdsSpaceCampHQ", label: "Facebook Ads (SPACE CAMP HQ)", csv: "Facebook Ads SPACE CAMP HQ" },

    instagramAdsXodia:       { id: "instagramAdsXodia",       label: "Instagram Ads (XODIA)",         csv: "Instagram Ads XODIA" },
    instagramAdsSpaceCampHQ: { id: "instagramAdsSpaceCampHQ", label: "Instagram Ads (SPACE CAMP HQ)", csv: "Instagram Ads SPACE CAMP HQ" },

    physicalFlyers: { id: "physicalFlyers", label: "Physical Flyers", csv: "Physical Flyers" },
    eventbriteAds:  { id: "eventbriteAds",  label: "Eventbrite Ads",  csv: "Eventbrite Ads" }
  },

  staff: {
    doorStaff:      { id: "doorStaff",      label: "Door Staff",      csv: "Door Staff" },
    merchTable:     { id: "merchTable",     label: "Merch Table",     csv: "Merch Table" },
    transportation: { id: "transportation", label: "Transportation",  csv: "Transportation" }
  },

  sales: {
    eventbriteSales: { id: "eventbriteSales", label: "Eventbrite Sales", csv: "Eventbrite Sales" },
    djPresales:      { id: "djPresales",      label: "DJ Presales",      csv: "DJ Presales" },
    promoTeam:       { id: "promoTeam",       label: "Promo Team",       csv: "Promo Team" },
    doorSales:       { id: "doorSales",       label: "Door Sales",       csv: "Door Sales" },
    merchSold:       { id: "merchSold",       label: "Merch Sold",       csv: "Merch Sold" }
  }
};

// Backward-compatibility label aliases (old CSVs -> new field labels)
const CSV_ALIASES = {
  "Flyer Cost": "Physical Flyers",
  "Physical Flyer Cost": "Physical Flyers",
  "Flyers": "Physical Flyers"
};

function collectCsvFields(node, out = []) {
  if (!node) return out;

  if (Array.isArray(node)) {
    node.forEach(v => collectCsvFields(v, out));
    return out;
  }

  if (typeof node === "object") {
    // Leaf field
    if (node.id && node.csv) {
      out.push(node);
      return out;
    }
    // Recurse
    Object.values(node).forEach(v => collectCsvFields(v, out));
  }

  return out;
}

// Map CSV label -> field (used by loadCSV)
const CSV_FIELD_BY_LABEL = (() => {
  const fields = collectCsvFields(FIELDS);
  const map = {};
  fields.forEach(f => { map[f.csv] = f; });
  return map;
})();

/* ============================================================
   GLOBAL STATE OBJECTS FOR DYNAMIC REPEATERS
============================================================ */

let headliners = {};
let localDJs = {};
let cdjs = {};
let showRunners = {};
let otherCats = {};
let vendors = {};

let chartExpenses = null;
let chartSales = null;

/* ============================================================
   HELPER – STORE/RESTORE DYNAMIC VALUES
============================================================ */

function storeValues(obj, prefix, count, fields) {
    obj[prefix] = {};
    for (let i = 1; i <= count; i++) {
        obj[prefix][i] = {};
        fields.forEach(f => {
            let el = document.getElementById(`${prefix}_${f}_${i}`);
            if (el) obj[prefix][i][f] = el.value;
        });
    }
}

function restoreValues(obj, prefix, fields) {
    if (!obj[prefix]) return;
    Object.keys(obj[prefix]).forEach(i => {
        fields.forEach(f => {
            let el = document.getElementById(`${prefix}_${f}_${i}`);
            if (el && obj[prefix][i][f] != null) el.value = obj[prefix][i][f];
        });
    });
}

/* ============================================================
   HEADLINERS REPEATER
============================================================ */

function regenerateHeadliners() {
    const container = document.getElementById("headlinerInputs");
    const oldCount = parseInt(document.getElementById("numHeadliners").dataset.old || 1);
    const newCount = parseInt(numHeadliners.value);

    storeValues(headliners, "headliner", oldCount, ["name", "fee", "hotel", "rider"]);

    container.innerHTML = "";

    for (let i = 1; i <= newCount; i++) {
        const card = document.createElement("div");
        card.className = "headliner-card";
        card.innerHTML = `
            <h3>Headliner ${i}</h3>

            <label>Name</label>
            <input id="headliner_name_${i}" type="text" oninput="updateBudget()"/>

            <label>Fee</label>
            <input id="headliner_fee_${i}" type="number" step="0.01" oninput="updateBudget()"/>

            <label>Hotel</label>
            <input id="headliner_hotel_${i}" type="number" step="0.01" oninput="updateBudget()"/>

            <label>Rider</label>
            <input id="headliner_rider_${i}" type="number" step="0.01" oninput="updateBudget()"/>
        `;
        container.appendChild(card);
    }

    restoreValues(headliners, "headliner", ["name", "fee", "hotel", "rider"]);
    document.getElementById("numHeadliners").dataset.old = newCount;

    autoExpand("section_headliners", "header_headliners");
    updateBudget();
}

/* ============================================================
   LOCAL DJS
============================================================ */

function regenerateLocalDJs() {
    const container = document.getElementById("localDJInputs");
    const old = parseInt(document.getElementById("numLocalDJs").dataset.old || 0);
    const n = parseInt(numLocalDJs.value);

    storeValues(localDJs, "localDJ", old, ["name", "fee"]);

    container.innerHTML = "";

    for (let i = 1; i <= n; i++) {
        container.innerHTML += `
            <label>Local DJ Name #${i}</label>
            <input id="localDJ_name_${i}" type="text" oninput="updateBudget()">

            <label>Local DJ Fee #${i}</label>
            <input id="localDJ_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
        `;
    }

    restoreValues(localDJs, "localDJ", ["name", "fee"]);
    document.getElementById("numLocalDJs").dataset.old = n;

    autoExpand("section_support", "header_support");
    updateBudget();
}

/* ============================================================
   CDJs
============================================================ */

function regenerateCDJs() {
    const container = document.getElementById("cdjInputs");
    const old = parseInt(document.getElementById("numCDJs").dataset.old || 0);
    const n = parseInt(numCDJs.value);

    storeValues(cdjs, "cdj", old, ["fee"]);
    container.innerHTML = "";

    for (let i = 1; i <= n; i++) {
        container.innerHTML += `
            <label>CDJ Fee #${i}</label>
            <input id="cdj_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
        `;
    }

    restoreValues(cdjs, "cdj", ["fee"]);
    document.getElementById("numCDJs").dataset.old = n;

    autoExpand("section_gear", "header_gear");
    updateBudget();
}

/* ============================================================
   SHOW RUNNERS
============================================================ */

function regenerateShowRunners() {
    const container = document.getElementById("showRunnerInputs");
    const old = parseInt(document.getElementById("numShowRunners").dataset.old || 0);
    const n = parseInt(numShowRunners.value);

    storeValues(showRunners, "showRunner", old, ["fee"]);
    container.innerHTML = "";

    for (let i = 1; i <= n; i++) {
        container.innerHTML += `
            <label>Show Runner Fee #${i}</label>
            <input id="showRunner_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
        `;
    }

    restoreValues(showRunners, "showRunner", ["fee"]);
    document.getElementById("numShowRunners").dataset.old = n;

    autoExpand("section_staff", "header_staff");
    updateBudget();
}

/* ============================================================
   MERCH VENDORS
============================================================ */

function regenerateVendors() {
    const container = document.getElementById("merchVendorInputs");
    const old = parseInt(document.getElementById("numMerchVendors").dataset.old || 0);
    const n = parseInt(numMerchVendors.value);

    storeValues(vendors, "merchVendor", old, ["name", "fee"]);
    container.innerHTML = "";

    for (let i = 1; i <= n; i++) {
        container.innerHTML += `
            <label>Vendor Name #${i}</label>
            <input id="merchVendor_name_${i}" type="text" oninput="updateBudget()">

            <label>Vendor Fee #${i}</label>
            <input id="merchVendor_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
        `;
    }

    restoreValues(vendors, "merchVendor", ["name", "fee"]);
    document.getElementById("numMerchVendors").dataset.old = n;

    updateBudget();
}

/* ============================================================
   OTHER CATEGORIES (multi-category system)
============================================================ */

function regenerateOtherCategories() {
    const newCount = parseInt(numOtherCategories.value) || 0;

    /* -------- STORE EXISTING DATA -------- */
    for (let c = 1; c <= Object.keys(otherCategoryState).length; c++) {
        const nameEl = document.getElementById(`otherCategoryName_${c}`);
        const countEl = document.getElementById(`otherCategoryCount_${c}`);

        if (!otherCategoryState[c]) otherCategoryState[c] = { items: {} };

        otherCategoryState[c].name = nameEl ? nameEl.value : '';
        otherCategoryState[c].count = countEl ? parseInt(countEl.value) || 0 : 0;

        for (let i = 1; i <= otherCategoryState[c].count; i++) {
            const name = document.getElementById(`otherCategory_${c}_itemName_${i}`)?.value || '';
            const fee  = document.getElementById(`otherCategory_${c}_itemFee_${i}`)?.value || '';
            otherCategoryState[c].items[i] = { name, fee };
        }
    }

    /* -------- REBUILD UI -------- */
    allOtherCategories.innerHTML = '';

    for (let c = 1; c <= newCount; c++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'other-category-wrapper';

        wrapper.innerHTML = `
            <label>Category ${c} Name:</label>
            <input id="otherCategoryName_${c}" type="text" oninput="updateBudget()">

            <div class="quantity-row">
                <label>Number of Items:</label>
                <input id="otherCategoryCount_${c}" type="number" min="0" max="20" value="0"
                       onchange="regenerateOtherItems(${c})">
            </div>

            <div id="otherCategoryItems_${c}"></div>
        `;

        allOtherCategories.appendChild(wrapper);

        /* -------- RESTORE CATEGORY DATA -------- */
        if (otherCategoryState[c]) {
            document.getElementById(`otherCategoryName_${c}`).value =
                otherCategoryState[c].name || '';

            document.getElementById(`otherCategoryCount_${c}`).value =
                otherCategoryState[c].count || 0;

            regenerateOtherItems(c);
        }
    }

    updateBudget();
}

function regenerateOtherItems(categoryId) {
    const count = parseInt(document.getElementById(`otherCategoryCount_${categoryId}`).value) || 0;
    const container = document.getElementById(`otherCategoryItems_${categoryId}`);

    if (!otherCategoryState[categoryId]) {
        otherCategoryState[categoryId] = { items: {} };
    }

    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const row = document.createElement('div');
        row.className = 'dynamic-input-group';

        row.innerHTML = `
            <label>Item ${i} Name:</label>
            <input id="otherCategory_${categoryId}_itemName_${i}" type="text"
                   oninput="updateBudget()">

            <label>Item ${i} Fee:</label>
            <input id="otherCategory_${categoryId}_itemFee_${i}" type="number" step="0.01"
                   oninput="updateBudget()">
        `;

        container.appendChild(row);

        /* -------- RESTORE ITEM DATA -------- */
        if (otherCategoryState[categoryId].items[i]) {
            document.getElementById(`otherCategory_${categoryId}_itemName_${i}`).value =
                otherCategoryState[categoryId].items[i].name || '';

            document.getElementById(`otherCategory_${categoryId}_itemFee_${i}`).value =
                otherCategoryState[categoryId].items[i].fee || '';
        }
    }

    updateBudget();
}

/* ============================================================
   BUDGET CALCULATOR ENGINE
============================================================ */

function getNum(id) {
  const el = document.getElementById(id);
  const v = el ? parseFloat(el.value) : 0;
  return Number.isFinite(v) ? v : 0;
}

function getStr(id) {
  const el = document.getElementById(id);
  return el ? (el.value || "") : "";
}

function updateBudget() {

  /* -------------------------
     TITLE
  -------------------------- */
  const title = document.getElementById("showTitle")?.value || "UNTITLED EVENT";
  const titleUpper = title.toUpperCase();

  const mainTitleEl = document.getElementById("showTitleDisplay");
  if (mainTitleEl) mainTitleEl.textContent = titleUpper;

  const chartsTitleEl = document.getElementById("chartsShowTitle");
  if (chartsTitleEl) chartsTitleEl.textContent = titleUpper;

  /* -------------------------
     HEADLINERS
  -------------------------- */
  let headlinerTotal = 0;
  const numHeadliners = +document.getElementById("numHeadliners")?.value || 0;

  for (let i = 1; i <= numHeadliners; i++) {
    headlinerTotal +=
      (+document.getElementById(`headliner_fee_${i}`)?.value || 0) +
      (+document.getElementById(`headliner_hotel_${i}`)?.value || 0) +
      (+document.getElementById(`headliner_rider_${i}`)?.value || 0);
  }

  /* -------------------------
     SUPPORT (Direct + Locals)
  -------------------------- */
  const directSupport = (+document.getElementById("directSupport")?.value || 0);

  let localDJTotal = 0;
  const numLocalDJs = +document.getElementById("numLocalDJs")?.value || 0;
  for (let i = 1; i <= numLocalDJs; i++) {
    localDJTotal += (+document.getElementById(`localDJ_fee_${i}`)?.value || 0);
  }

  /* -------------------------
     PRODUCTION
  -------------------------- */
  const productionTotal =
    (+document.getElementById("vjFee")?.value || 0) +
    (+document.getElementById("venue")?.value || 0) +
    (+document.getElementById("ledWall")?.value || 0) +
    (+document.getElementById("lights")?.value || 0) +
    (+document.getElementById("lasers")?.value || 0);

  /* -------------------------
     GEAR
  -------------------------- */
  let cdjTotal = 0;
  const numCDJs = +document.getElementById("numCDJs")?.value || 0;
  for (let i = 1; i <= numCDJs; i++) {
    cdjTotal += (+document.getElementById(`cdj_fee_${i}`)?.value || 0);
  }

  const gearTotal =
    cdjTotal +
    (+document.getElementById("sound")?.value || 0) +
    (+document.getElementById("mixer")?.value || 0) +
    (+document.getElementById("table")?.value || 0);

  /* -------------------------
     MARKETING
  -------------------------- */
  const marketingTotal =
    (+document.getElementById("facebookAdsXodia")?.value || 0) +
    (+document.getElementById("facebookAdsSpaceCampHQ")?.value || 0) +
    (+document.getElementById("instagramAdsXodia")?.value || 0) +
    (+document.getElementById("instagramAdsSpaceCampHQ")?.value || 0) +
    (+document.getElementById("physicalFlyers")?.value || 0) +
    (+document.getElementById("eventbriteAds")?.value || 0);

  /* -------------------------
     STAFF
  -------------------------- */
  let showRunnerTotal = 0;
  const numShowRunners = +document.getElementById("numShowRunners")?.value || 0;
  for (let i = 1; i <= numShowRunners; i++) {
    showRunnerTotal += (+document.getElementById(`showRunner_fee_${i}`)?.value || 0);
  }

  const staffTotal =
    (+document.getElementById("doorStaff")?.value || 0) +
    (+document.getElementById("merchTable")?.value || 0) +
    (+document.getElementById("transportation")?.value || 0) +
    showRunnerTotal;

  /* -------------------------
     OTHER CATEGORIES
  -------------------------- */
  let otherTotal = 0;
  const numOtherCategories = +document.getElementById("numOtherCategories")?.value || 0;

  for (let c = 1; c <= numOtherCategories; c++) {
    const count = +document.getElementById(`otherCategoryCount_${c}`)?.value || 0;
    for (let i = 1; i <= count; i++) {
      otherTotal += +document.getElementById(`otherCategory_${c}_itemFee_${i}`)?.value || 0;
    }
  }

  /* -------------------------
     EXPENSE TOTAL
  -------------------------- */
  const totalExpenses =
    headlinerTotal +
    directSupport +
    localDJTotal +
    productionTotal +
    gearTotal +
    marketingTotal +
    staffTotal +
    otherTotal;

  /* -------------------------
     REVENUE
  -------------------------- */
  const eventbriteSales = (+document.getElementById("eventbriteSales")?.value || 0);
  const djPresales      = (+document.getElementById("djPresales")?.value || 0);
  const promoTeam       = (+document.getElementById("promoTeam")?.value || 0);
  const doorSales       = (+document.getElementById("doorSales")?.value || 0);
  const merchSold       = (+document.getElementById("merchSold")?.value || 0);

  // Group ALL vendor fees into one wedge: "Merch Vendors"
  let merchVendorTotal = 0;
  document.querySelectorAll('input[id^="merchVendor_fee_"]').forEach(el => {
    merchVendorTotal += parseFloat(el.value) || 0;
  });

  const totalRevenue =
    eventbriteSales +
    djPresales +
    promoTeam +
    doorSales +
    merchSold +
    merchVendorTotal;

  /* -------------------------
     NET PROFIT
  -------------------------- */
  const netProfit = totalRevenue - totalExpenses;

  /* -------------------------
     UI OUTPUT
  -------------------------- */
  const totalExpensesEl = document.getElementById("totalExpenses");
  if (totalExpensesEl) totalExpensesEl.textContent = totalExpenses.toFixed(2);

  const totalRevenueEl = document.getElementById("totalRevenue");
  if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toFixed(2);

  const profitLine = document.getElementById("profitLine");
  if (profitLine) {
    // Keep the net profit as its own element so we can style just the number.
    let netProfitEl = document.getElementById("netProfit");

    // If a previous version overwrote the line and removed the span, rebuild it.
    if (!netProfitEl) {
      profitLine.innerHTML = `Net Profit: <span id="netProfit"></span>`;
      netProfitEl = document.getElementById("netProfit");
    }

    profitLine.className = netProfit >= 0 ? "profit" : "loss";

    if (netProfitEl) {
      netProfitEl.textContent = `${netProfit >= 0 ? "+" : "-"}$${Math.abs(netProfit).toFixed(2)}`;
      netProfitEl.style.color = netProfit < 0 ? "red" : "";
    }
  }

  /* -------------------------
     TEXT PREVIEW
  -------------------------- */
  updateTextPreview({ netProfit });

  /* -------------------------
     CHARTS
  -------------------------- */
  updateCharts(
    {
      Headliners: headlinerTotal,
      Support: directSupport + localDJTotal,
      Production: productionTotal,
      Gear: gearTotal,
      Marketing: marketingTotal,
      Staff: staffTotal,
      Other: otherTotal
    },
    {
      Eventbrite: eventbriteSales,
      Presales: djPresales,
      Promo: promoTeam,
      Door: doorSales,
      "Merch Sold": merchSold,
      "Merch Vendors": merchVendorTotal
    }
  );
}


/* ============================================================
   TEXT PREVIEW
============================================================ */

function updateTextPreview(data = {}) {
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



/* ============================================================
   PIE CHART RENDERING
============================================================ */

function updateCharts(expenseMap, revenueMap) {
  const fmtUSD = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(+v || 0);

  const toNum = (v) => (Number.isFinite(+v) ? +v : 0);

  const cycleColors = (colors, n) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(colors[i % colors.length]);
    return out;
  };

  // Build sorted, positive-only entries (keeps charts clean)
  const buildEntries = (mapObj) => {
    const entries = Object.entries(mapObj || {})
      .map(([k, v]) => [k, toNum(v)])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: entries.map((e) => e[0]),
      values: entries.map((e) => e[1]),
    };
  };

  // Visibility helpers (Chart.js v3/v4)
  const isVisible = (chart, i) => {
    if (typeof chart.getDataVisibility === "function") return chart.getDataVisibility(i);
    const meta = chart.getDatasetMeta(0);
    const el = meta?.data?.[i];
    return !(el && el.hidden === true);
  };

  const visibleTotal = (chart, values) => {
    let t = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > 0 && isVisible(chart, i)) t += values[i];
    }
    return t;
  };

  const legendOnClick = (e, legendItem, legend) => {
    const chart = legend.chart;
    const idx = legendItem.index;

    if (typeof chart.toggleDataVisibility === "function") {
      chart.toggleDataVisibility(idx);
    } else {
      const meta = chart.getDatasetMeta(0);
      if (meta?.data?.[idx]) meta.data[idx].hidden = !meta.data[idx].hidden;
    }

    chart.update(); // <- forces legend text recompute
  };

  const makeLegendGenerateLabels = () => (chart) => {
    const ds = chart.data.datasets?.[0];
    const labels = chart.data.labels || [];
    const values = (ds?.data || []).map(toNum);
    const total = visibleTotal(chart, values);

    return labels.map((label, i) => {
      const v = values[i] || 0;
      const pct = total > 0 ? (v / total) * 100 : 0;

      const fillStyle = Array.isArray(ds.backgroundColor)
        ? ds.backgroundColor[i]
        : ds.backgroundColor;

      return {
        text: `${label}: ${fmtUSD(v)} (${pct.toFixed(0)}%)`,
        fillStyle,
        strokeStyle: fillStyle,
        lineWidth: 1,
        hidden: !isVisible(chart, i),
        index: i,
      };
    });
  };

  const tooltipLabel = (ctx) => {
    const v = toNum(ctx.parsed);
    const values = (ctx.chart.data.datasets?.[0]?.data || []).map(toNum);
    const total = visibleTotal(ctx.chart, values);
    const pct = total > 0 ? (v / total) * 100 : 0;

    // Dollar FIRST, then percent
    return `${ctx.label}: ${fmtUSD(v)} (${pct.toFixed(0)}%)`;
  };

  const EXP_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#9C27B0", "#FF9800", "#607D8B"];
  const REV_COLORS = ["#4CAF50", "#03A9F4", "#FFC107", "#E91E63", "#9E9E9E"];

  const exp = buildEntries(expenseMap);
  const rev = buildEntries(revenueMap);

  const makeOrUpdatePie = (existingChart, canvasId, labels, values, baseColors) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return existingChart;

    const colors = cycleColors(baseColors, values.length);

    if (!existingChart) {
      return new Chart(canvas.getContext("2d"), {
        type: "pie",
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              onClick: legendOnClick,
              labels: {
                generateLabels: makeLegendGenerateLabels(),
              },
            },
            tooltip: {
              callbacks: { label: tooltipLabel },
            },
          },
        },
      });
    }

    // Update existing chart in-place (keeps it stable + refreshes legend)
    existingChart.data.labels = labels;
    existingChart.data.datasets[0].data = values;
    existingChart.data.datasets[0].backgroundColor = colors;

    // If slice count changed, reset visibility so legend math stays sane
    if (typeof existingChart.setDataVisibility === "function") {
      for (let i = 0; i < labels.length; i++) existingChart.setDataVisibility(i, true);
    }

    existingChart.update();
    return existingChart;
  };

  chartExpenses = makeOrUpdatePie(chartExpenses, "expensesChart", exp.labels, exp.values, EXP_COLORS);
  chartSales    = makeOrUpdatePie(chartSales, "salesChart",    rev.labels, rev.values, REV_COLORS);

  // Keep downloadChartsPNG() happy if it checks window.*
  window.chartExpenses = chartExpenses;
  window.chartSales = chartSales;
}

/* ============================================================
   CSV EXPORT
============================================================ */

function downloadCSV() {
  const rows = [];

  const csvCell = (v) => {
    const s = (v == null) ? "" : String(v);
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const pushKV = (label, value) => rows.push(`${label},${csvCell(value)}`);
  const pushField = (field) => pushKV(field.csv, document.getElementById(field.id)?.value || "");

  // CSV VERSION HEADER
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
    pushKV(`Headliner ${i} Fee`, document.getElementById(`headliner_fee_${i}`)?.value || "");
    pushKV(`Headliner ${i} Hotel`, document.getElementById(`headliner_hotel_${i}`)?.value || "");
    pushKV(`Headliner ${i} Rider`, document.getElementById(`headliner_rider_${i}`)?.value || "");
    pushKV(`Headliner ${i} Name`, document.getElementById(`headliner_name_${i}`)?.value || "");
  }
  rows.push("");

  // SUPPORT
  rows.push("Support:");
  pushKV("Direct Support Fee", document.getElementById("directSupport")?.value || "");
  const numLocalDJs = +document.getElementById("numLocalDJs")?.value || 0;
  for (let i = 1; i <= numLocalDJs; i++) {
    pushKV(`Local DJ ${i} Name`, document.getElementById(`localDJ_name_${i}`)?.value || "");
    pushKV(`Local DJ ${i} Fee`, document.getElementById(`localDJ_fee_${i}`)?.value || "");
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
    const name = document.getElementById(`otherCategoryName_${c}`)?.value || "";
    const count = document.getElementById(`otherCategoryCount_${c}`)?.value || 0;

    pushKV(`Category ${c} Name`, name);
    pushKV(`Category ${c} Items Count`, count);

    for (let i = 1; i <= (+count || 0); i++) {
      pushKV(`Category ${c} Item ${i} Name`, document.getElementById(`otherCategory_${c}_itemName_${i}`)?.value || "");
      pushKV(`Category ${c} Item ${i} Fee`, document.getElementById(`otherCategory_${c}_itemFee_${i}`)?.value || "");
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
    pushKV(`Vendor ${i} Fee`, document.getElementById(`merchVendor_fee_${i}`)?.value || "");
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

function triggerImport() {
  const input = document.getElementById("csvFileInput");
  if (!input) return;

  // Allows importing the same file twice in a row
  input.value = "";
  input.click();
}

(() => {
  const input = document.getElementById("csvFileInput");
  if (!input) return;

  input.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = (ev) => loadCSV(ev.target.result || "");
    reader.readAsText(f);
  });
})();

function loadCSV(fileOrText) {
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
      else if (typeof regenerateMerchVendors === "function") regenerateMerchVendors(); // fallback if ever added
    };

    const regenOtherItems = (categoryId) => {
      if (typeof regenerateOtherItems === "function") regenerateOtherItems(categoryId);
      else if (typeof regenerateOtherCategoryItems === "function") regenerateOtherCategoryItems(categoryId); // fallback if ever added
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

      if ((m = label.match(/^Headliner\s+(\d+)\b/i))) maxHead = Math.max(maxHead, +m[1]);
      if ((m = label.match(/^Local DJ\s+(\d+)\b/i))) maxLocal = Math.max(maxLocal, +m[1]);
      if ((m = label.match(/^CDJ\s+(\d+)\b/i))) maxCDJ = Math.max(maxCDJ, +m[1]);
      if ((m = label.match(/^Show Runner\s+(\d+)\b/i))) maxRunner = Math.max(maxRunner, +m[1]);
      if ((m = label.match(/^Vendor\s+(\d+)\b/i))) maxVendor = Math.max(maxVendor, +m[1]);

      // Other categories: detect max category index from *any* of the category-related lines
      if ((m = label.match(/^Category\s+(\d+)\s+Name$/i))) maxOtherCats = Math.max(maxOtherCats, +m[1]);
      if ((m = label.match(/^Category\s+(\d+)\s+Items Count$/i))) maxOtherCats = Math.max(maxOtherCats, +m[1]);
      if ((m = label.match(/^Category\s+(\d+)\s+Item\s+(\d+)\s+(Name|Fee)$/i))) maxOtherCats = Math.max(maxOtherCats, +m[1]);

      // Legacy marketing labels
      if (label === "Facebook Ads") legacyFbAmount = value;
      if (label === "Facebook Ads Account") legacyFbAccount = value;
      if (label === "Instagram Ads") legacyIgAmount = value;
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

      // Show Runners
      if ((m = label.match(/^Show Runner\s+(\d+)\s+Fee$/i))) { setVal(`showRunner_fee_${m[1]}`, value); continue; }

      // ---- OTHER CATEGORIES ----
      if ((m = label.match(/^Category\s+(\d+)\s+Name$/i))) {
        const c = +m[1];
        ensureOtherCategories(c);
        currentCategory = c;
        setVal(`otherCategoryName_${c}`, value);
        continue;
      }

      if ((m = label.match(/^Category\s+(\d+)\s+Items Count$/i))) {
        const c = +m[1];
        ensureOtherCategories(c);
        currentCategory = c;
        setVal(`otherCategoryCount_${c}`, value);
        regenOtherItems(c);
        continue;
      }

      if ((m = label.match(/^Category\s+(\d+)\s+Item\s+(\d+)\s+Name$/i))) {
        const c = +m[1];
        const i = +m[2];
        ensureOtherItemRow(c, i);
        currentCategory = c;
        setVal(`otherCategory_${c}_itemName_${i}`, value);
        continue;
      }

      if ((m = label.match(/^Category\s+(\d+)\s+Item\s+(\d+)\s+Fee$/i))) {
        const c = +m[1];
        const i = +m[2];
        ensureOtherItemRow(c, i);
        currentCategory = c;
        setVal(`otherCategory_${c}_itemFee_${i}`, value);
        continue;
      }

      // Legacy (no category prefix): "Item 1 Name/Fee" after a "Category X Name" line
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



function getPreviewText() {
  const el = document.getElementById("textPreview");
  return el ? (el.textContent || "") : "";
}

function safeFileName(str) {
  return (str || "")
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "") // illegal filename chars
    .replace(/\s+/g, "_")
    .slice(0, 80) || "budget_export";
}

function getExportBaseName() {
  const titleRaw = (document.getElementById("showTitle")?.value || "UNTITLED_EVENT").trim();
  const dateRaw  = (document.getElementById("showDate")?.value  || "NO_DATE").trim();

  // budget + show name + date
  return safeFileName(`budget_${titleRaw}_${dateRaw}`);
}

function buildCsvFileName() {
  return `${getExportBaseName()}.csv`;
}

function buildChartsPngFileName() {
  return `${getExportBaseName()}_charts.png`;
}

function buildTxtFileName() {
  const title = document.getElementById("showTitle")?.value || "";
  const date  = document.getElementById("showDate")?.value || "";
  const base = [title, date].filter(Boolean).join("_");
  return safeFileName(base) + ".txt";
}

async function copyTextPreview() {
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
      document.body.removeChild(ta);
    }

    if (status) {
      status.textContent = "Copied.";
      setTimeout(() => (status.textContent = ""), 1500);
    }
  } catch (err) {
    if (status) status.textContent = "Copy failed.";
    console.error(err);
  }
}

function exportTextPreviewTxt() {
  updateBudget();

  const text = getPreviewText();
  const blob = new Blob([text], { type: "text/plain" });

  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);

  a.href = url;
  a.download = buildTxtFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ============================================================
   FORM RESET
============================================================ */

function resetForm() {
    budgetForm.reset();

    numHeadliners.value = 1;
    numLocalDJs.value = 0;
    numCDJs.value = 0;
    numShowRunners.value = 0;
    numOtherCategories.value = 0;
    numMerchVendors.value = 0;

    headliners = {};
    localDJs = {};
    cdjs = {};
    showRunners = {};
    otherCats = {};
    vendors = {};

    document.getElementById("headlinerInputs").innerHTML = "";
    document.getElementById("localDJInputs").innerHTML = "";
    document.getElementById("cdjInputs").innerHTML = "";
    document.getElementById("showRunnerInputs").innerHTML = "";
    document.getElementById("allOtherCategories").innerHTML = "";
    document.getElementById("merchVendorInputs").innerHTML = "";

    regenerateHeadliners();
    updateBudget();
}

/* ============================================================
   INIT
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Assign header labels for arrow rendering
    collapsibleSections.forEach(sec => {
        const header = document.getElementById(sec.header);
        if (header) header.dataset.label = header.textContent.trim().replace(/^▾|▸/, "");
    });

    initCollapsibles();
    regenerateHeadliners();
    updateBudget();
});
function toggleCollapse(id) {
    const section = document.getElementById(id);

    if (!section) return;

    // Toggle OPEN state
    section.classList.toggle("open");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function makeSafeFilename(s) {
  return (s || "")
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

async function downloadChartsPNG(filename) {
  // IMPORTANT: do NOT use window.chartExpenses when charts are declared with top-level `let`
  if (!chartExpenses || !chartSales) {
    alert("Charts are not ready yet. Click Update Chart first.");
    return;
  }

  // Try to force a final render before capture
  try {
    chartExpenses.update("none");
    chartSales.update("none");
  } catch (e) {
    // ignore
  }

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const expURL = (typeof chartExpenses.toBase64Image === "function")
    ? chartExpenses.toBase64Image()
    : chartExpenses.canvas.toDataURL("image/png");

  const salesURL = (typeof chartSales.toBase64Image === "function")
    ? chartSales.toBase64Image()
    : chartSales.canvas.toDataURL("image/png");

  const [expImg, salesImg] = await Promise.all([loadImage(expURL), loadImage(salesURL)]);

  // Optional: auto filename from Show Title / Date if not provided
  if (!filename) {
    const title = makeSafeFilename(document.getElementById("showTitle")?.value || "UNTITLED EVENT");
    const date  = makeSafeFilename(document.getElementById("showDate")?.value || "");
    filename = `${title}${date ? "_" + date : ""}_charts.png`;
  }

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

function downloadAll() {
  // Note: some browsers may prompt to allow multiple downloads.
  if (typeof updateBudget === "function") updateBudget();

  downloadCSV();
  exportTextPreviewTxt();

  // Small delay helps ensure the canvases are fully painted before capture
  setTimeout(() => {
    downloadChartsPNG();
  }, 150);
}
