// js/core/budget.js
// Core totals engine + summary UI
import { updateTextPreview } from "./textPreview.js";
import { updateCharts } from "./charts.js";

export function updateBudget() {

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
     SUPPORT
  -------------------------- */
  const directSupport = +document.getElementById("directSupport")?.value || 0;

  let localDJTotal = 0;
  const numLocalDJs = +document.getElementById("numLocalDJs")?.value || 0;
  for (let i = 1; i <= numLocalDJs; i++) {
    localDJTotal += +document.getElementById(`localDJ_fee_${i}`)?.value || 0;
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
     GEAR RENTALS
  -------------------------- */
  let cdjTotal = 0;
  const numCDJs = +document.getElementById("numCDJs")?.value || 0;
  for (let i = 1; i <= numCDJs; i++) {
    cdjTotal += +document.getElementById(`cdj_fee_${i}`)?.value || 0;
  }

  const gearTotal =
    cdjTotal +
    (+document.getElementById("sound")?.value || 0) +
    (+document.getElementById("mixer")?.value || 0) +
    (+document.getElementById("table")?.value || 0);

  /* -------------------------
     MARKETING
  -------------------------- */
  const fbX = +document.getElementById("facebookAdsXodia")?.value || 0;
  const fbS = +document.getElementById("facebookAdsSpaceCampHQ")?.value || 0;
  const igX = +document.getElementById("instagramAdsXodia")?.value || 0;
  const igS = +document.getElementById("instagramAdsSpaceCampHQ")?.value || 0;

  const marketingTotal =
    fbX + fbS +
    igX + igS +
    (+document.getElementById("physicalFlyers")?.value || 0) +
    (+document.getElementById("eventbriteAds")?.value || 0);

  /* -------------------------
     STAFF
  -------------------------- */
  let showRunnerTotal = 0;
  const numShowRunners = +document.getElementById("numShowRunners")?.value || 0;
  for (let i = 1; i <= numShowRunners; i++) {
    showRunnerTotal += +document.getElementById(`showRunner_fee_${i}`)?.value || 0;
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
    // If a previous version overwrote the line and removed the span, rebuild it.
    let netProfitEl = document.getElementById("netProfit");
    if (!netProfitEl) {
      profitLine.innerHTML = `Net Profit: <span id="netProfit"></span>`;
      netProfitEl = document.getElementById("netProfit");
    } else {
      // Normalize markup so the sign can be placed before the "$"
      profitLine.innerHTML = `Net Profit: <span id="netProfit"></span>`;
      netProfitEl = document.getElementById("netProfit");
    }

    profitLine.className = netProfit >= 0 ? "profit" : "loss";

    if (netProfitEl) {
      netProfitEl.textContent = `${netProfit >= 0 ? "+" : "-"}$${Math.abs(netProfit).toFixed(2)}`;
      netProfitEl.classList.toggle("negative", netProfit < 0);
      netProfitEl.classList.toggle("positive", netProfit >= 0);
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
