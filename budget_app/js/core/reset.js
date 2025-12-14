// js/core/reset.js
// Resets the form and dynamic sections to defaults.

import { regenerateHeadliners, clearRepeaterState } from "../ui/repeaters.js";
import { updateBudget } from "./budget.js";

export function resetForm() {
  const form = document.getElementById("budgetForm");
  if (form && typeof form.reset === "function") form.reset();

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };

  // Defaults (matching your current app behavior)
  setVal("numHeadliners", 1);
  setVal("numLocalDJs", 0);
  setVal("numCDJs", 0);
  setVal("numShowRunners", 0);
  setVal("numOtherCategories", 0);
  setVal("numMerchVendors", 0);

  // Clear repeater state + DOM containers
  clearRepeaterState();

  const clearHTML = (id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  };

  clearHTML("headlinerInputs");
  clearHTML("localDJInputs");
  clearHTML("cdjInputs");
  clearHTML("showRunnerInputs");
  clearHTML("allOtherCategories");
  clearHTML("merchVendorInputs");

  // Rebuild headliners (default = 1)
  regenerateHeadliners();

  // Refresh totals/preview/charts
  updateBudget();
}
