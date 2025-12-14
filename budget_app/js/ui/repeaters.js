// js/ui/repeaters.js
// Dynamic input generators (Headliners, Local DJs, CDJs, Show Runners, Vendors, Other Categories)

import { autoExpand } from "./collapsibles.js";

// Repeater state stores (used to preserve values across regeneration)
export const headliners = {};
export const localDJs = {};
export const cdjs = {};
export const showRunners = {};
export const vendors = {};

// Other categories + items state
export const otherCategoryState = {};

/**
 * Stores values for repeater inputs by prefix pattern:
 *   `${prefix}_${field}_${i}`
 */
export function storeValues(obj, prefix, count, fields) {
  obj[prefix] = {};
  for (let i = 1; i <= count; i++) {
    obj[prefix][i] = {};
    fields.forEach(f => {
      const el = document.getElementById(`${prefix}_${f}_${i}`);
      if (el) obj[prefix][i][f] = el.value;
    });
  }
}

/**
 * Restores values for repeater inputs by prefix pattern:
 *   `${prefix}_${field}_${i}`
 */
export function restoreValues(obj, prefix, fields) {
  if (!obj[prefix]) return;
  Object.keys(obj[prefix]).forEach(i => {
    fields.forEach(f => {
      const el = document.getElementById(`${prefix}_${f}_${i}`);
      if (el && obj[prefix][i][f] != null) el.value = obj[prefix][i][f];
    });
  });
}

function callUpdateBudget() {
  if (typeof window.updateBudget === "function") window.updateBudget();
}

export function regenerateHeadliners() {
  const container = document.getElementById("headlinerInputs");
  const numEl = document.getElementById("numHeadliners");
  if (!container || !numEl) return;

  const oldCount = parseInt(numEl.dataset.old || numEl.value || "0", 10) || 0;
  const newCount = parseInt(numEl.value || "0", 10) || 0;

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
  numEl.dataset.old = String(newCount);

  autoExpand("col_headliners");
  callUpdateBudget();
}

export function regenerateLocalDJs() {
  const container = document.getElementById("localDJInputs");
  const numEl = document.getElementById("numLocalDJs");
  if (!container || !numEl) return;

  const oldCount = parseInt(numEl.dataset.old || numEl.value || "0", 10) || 0;
  const newCount = parseInt(numEl.value || "0", 10) || 0;

  storeValues(localDJs, "localDJ", oldCount, ["name", "fee"]);
  container.innerHTML = "";

  for (let i = 1; i <= newCount; i++) {
    container.innerHTML += `
      <label>Local DJ Name #${i}</label>
      <input id="localDJ_name_${i}" type="text" oninput="updateBudget()">

      <label>Local DJ Fee #${i}</label>
      <input id="localDJ_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
    `;
  }

  restoreValues(localDJs, "localDJ", ["name", "fee"]);
  numEl.dataset.old = String(newCount);

  autoExpand("col_support");
  callUpdateBudget();
}

export function regenerateCDJs() {
  const container = document.getElementById("cdjInputs");
  const numEl = document.getElementById("numCDJs");
  if (!container || !numEl) return;

  const oldCount = parseInt(numEl.dataset.old || numEl.value || "0", 10) || 0;
  const newCount = parseInt(numEl.value || "0", 10) || 0;

  storeValues(cdjs, "cdj", oldCount, ["fee"]);
  container.innerHTML = "";

  for (let i = 1; i <= newCount; i++) {
    container.innerHTML += `
      <label>CDJ Fee #${i}</label>
      <input id="cdj_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
    `;
  }

  restoreValues(cdjs, "cdj", ["fee"]);
  numEl.dataset.old = String(newCount);

  autoExpand("col_gear");
  callUpdateBudget();
}

export function regenerateShowRunners() {
  const container = document.getElementById("showRunnerInputs");
  const numEl = document.getElementById("numShowRunners");
  if (!container || !numEl) return;

  const oldCount = parseInt(numEl.dataset.old || numEl.value || "0", 10) || 0;
  const newCount = parseInt(numEl.value || "0", 10) || 0;

  storeValues(showRunners, "showRunner", oldCount, ["fee"]);
  container.innerHTML = "";

  for (let i = 1; i <= newCount; i++) {
    container.innerHTML += `
      <label>Show Runner Fee #${i}</label>
      <input id="showRunner_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
    `;
  }

  restoreValues(showRunners, "showRunner", ["fee"]);
  numEl.dataset.old = String(newCount);

  autoExpand("col_staff");
  callUpdateBudget();
}

export function regenerateVendors() {
  const container = document.getElementById("merchVendorInputs");
  const numEl = document.getElementById("numMerchVendors");
  if (!container || !numEl) return;

  const oldCount = parseInt(numEl.dataset.old || numEl.value || "0", 10) || 0;
  const newCount = parseInt(numEl.value || "0", 10) || 0;

  storeValues(vendors, "merchVendor", oldCount, ["name", "fee"]);
  container.innerHTML = "";

  for (let i = 1; i <= newCount; i++) {
    container.innerHTML += `
      <label>Vendor Name #${i}</label>
      <input id="merchVendor_name_${i}" type="text" oninput="updateBudget()">

      <label>Vendor Fee #${i}</label>
      <input id="merchVendor_fee_${i}" type="number" step="0.01" oninput="updateBudget()">
    `;
  }

  restoreValues(vendors, "merchVendor", ["name", "fee"]);
  numEl.dataset.old = String(newCount);

  autoExpand("col_sales");
  callUpdateBudget();
}

export function regenerateOtherCategories() {
  const numEl = document.getElementById("numOtherCategories");
  const allOtherCategories = document.getElementById("allOtherCategories");
  if (!numEl || !allOtherCategories) return;

  const oldCount = parseInt(numEl.dataset.old || numEl.value || "0", 10) || 0;
  const newCount = parseInt(numEl.value || "0", 10) || 0;

  // STORE existing category + item values
  for (let c = 1; c <= oldCount; c++) {
    const nameEl = document.getElementById(`otherCategoryName_${c}`);
    const countEl = document.getElementById(`otherCategoryCount_${c}`);

    if (!otherCategoryState[c]) otherCategoryState[c] = { items: {} };

    const itemCount = countEl ? (parseInt(countEl.value, 10) || 0) : 0;
    otherCategoryState[c].name = nameEl ? nameEl.value : "";
    otherCategoryState[c].count = itemCount;

    otherCategoryState[c].items = otherCategoryState[c].items || {};
    for (let i = 1; i <= itemCount; i++) {
      const itemName = document.getElementById(`otherCategory_${c}_itemName_${i}`)?.value || "";
      const itemFee  = document.getElementById(`otherCategory_${c}_itemFee_${i}`)?.value || "";
      otherCategoryState[c].items[i] = { name: itemName, fee: itemFee };
    }
  }

  // Drop state for removed categories
  Object.keys(otherCategoryState).forEach(k => {
    const c = parseInt(k, 10);
    if (c > newCount) delete otherCategoryState[c];
  });

  // REBUILD UI
  allOtherCategories.innerHTML = "";

  for (let c = 1; c <= newCount; c++) {
    const wrapper = document.createElement("div");
    wrapper.className = "other-category-wrapper";
    wrapper.innerHTML = `
      <label>Category ${c} Name:</label>
      <input id="otherCategoryName_${c}" type="text" oninput="updateBudget()">

      <div class="quantity-row">
        <label>Number of Items:</label>
        <input
          id="otherCategoryCount_${c}"
          type="number"
          min="0"
          max="20"
          value="0"
          onchange="regenerateOtherItems(${c})"
        >
      </div>

      <div id="otherCategoryItems_${c}"></div>
    `;

    allOtherCategories.appendChild(wrapper);

    // RESTORE category data
    if (otherCategoryState[c]) {
      document.getElementById(`otherCategoryName_${c}`).value = otherCategoryState[c].name || "";
      document.getElementById(`otherCategoryCount_${c}`).value = otherCategoryState[c].count || 0;
      regenerateOtherItems(c);
    }
  }

  numEl.dataset.old = String(newCount);

  autoExpand("col_other");
  callUpdateBudget();
}

export function regenerateOtherItems(categoryId) {
  const countEl = document.getElementById(`otherCategoryCount_${categoryId}`);
  const container = document.getElementById(`otherCategoryItems_${categoryId}`);
  if (!countEl || !container) return;

  const newCount = parseInt(countEl.value, 10) || 0;

  if (!otherCategoryState[categoryId]) otherCategoryState[categoryId] = { items: {} };
  otherCategoryState[categoryId].items = otherCategoryState[categoryId].items || {};

  // STORE existing item values before rebuilding (fixes losing values on count change)
  const prevCount = parseInt(container.dataset.old || "0", 10) || 0;
  for (let i = 1; i <= prevCount; i++) {
    const name = document.getElementById(`otherCategory_${categoryId}_itemName_${i}`)?.value || "";
    const fee  = document.getElementById(`otherCategory_${categoryId}_itemFee_${i}`)?.value || "";
    otherCategoryState[categoryId].items[i] = { name, fee };
  }

  otherCategoryState[categoryId].count = newCount;

  container.innerHTML = "";

  for (let i = 1; i <= newCount; i++) {
    const row = document.createElement("div");
    row.className = "dynamic-input-group";
    row.innerHTML = `
      <label>Item ${i} Name:</label>
      <input
        id="otherCategory_${categoryId}_itemName_${i}"
        type="text"
        oninput="updateBudget()"
      >

      <label>Item ${i} Fee:</label>
      <input
        id="otherCategory_${categoryId}_itemFee_${i}"
        type="number"
        step="0.01"
        oninput="updateBudget()"
      >
    `;

    container.appendChild(row);

    // RESTORE item data
    const saved = otherCategoryState[categoryId].items[i];
    if (saved) {
      document.getElementById(`otherCategory_${categoryId}_itemName_${i}`).value = saved.name || "";
      document.getElementById(`otherCategory_${categoryId}_itemFee_${i}`).value  = saved.fee  || "";
    }
  }

  container.dataset.old = String(newCount);

  autoExpand("col_other");
  callUpdateBudget();
}

// Optional utility for reset modules
export function clearRepeaterState() {
  [headliners, localDJs, cdjs, showRunners, vendors].forEach(obj => {
    Object.keys(obj).forEach(k => delete obj[k]);
  });
  Object.keys(otherCategoryState).forEach(k => delete otherCategoryState[k]);
}
