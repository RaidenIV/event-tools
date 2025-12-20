// uiHandlers.js - UI event handlers for server budget loading

import {
  loadBudgetFromServer,
  fetchBudgetList,
  populateBudgetSelector,
  saveBudgetToServer,
  searchBudgets,
  deleteBudgetFromServer
} from './modules/serverLoad.js';

import { updateBudget } from './main.js';
import { downloadCSV } from './modules/csv.js';

// Store currently selected budget ID
let selectedBudgetId = null;

/**
 * Initialize the budget selector dropdown
 */
export async function initBudgetSelector() {
  await populateBudgetSelector('budgetSelector');
}

/**
 * Handle budget selection from dropdown
 */
export function handleBudgetSelection(budgetId) {
  selectedBudgetId = budgetId;
}

/**
 * Load the selected budget
 */
export async function handleLoadSelectedBudget() {
  if (!selectedBudgetId) {
    alert('Please select a budget first');
    return;
  }

  const regenerators = {
    headliners: () => window.regenerateHeadliners(),
    localDJs: () => window.regenerateLocalDJs(),
    cdjs: () => window.regenerateCDJs(),
    showRunners: () => window.regenerateShowRunners(),
    vendors: () => window.regenerateVendors(),
    otherCategories: () => window.regenerateOtherCategories(),
    otherItems: (c) => window.regenerateOtherItems(c)
  };

  await loadBudgetFromServer(selectedBudgetId, regenerators, updateBudget);
}

/**
 * Search budgets with filters
 */
export async function handleSearchBudgets() {
  const name = document.getElementById('searchName')?.value || '';
  const dateFrom = document.getElementById('searchDateFrom')?.value || '';
  const dateTo = document.getElementById('searchDateTo')?.value || '';

  try {
    const results = await searchBudgets({ name, dateFrom, dateTo });
    displaySearchResults(results);
  } catch (error) {
    alert('Search failed: ' + error.message);
  }
}

/**
 * Display search results in the UI
 */
function displaySearchResults(budgets) {
  const resultsContainer = document.getElementById('budgetResults');
  if (!resultsContainer) return;

  if (budgets.length === 0) {
    resultsContainer.innerHTML = '<p>No budgets found</p>';
    return;
  }

  resultsContainer.innerHTML = budgets.map(budget => `
    <div class="budget-item">
      <div class="budget-item-name">${budget.name}</div>
      <div class="budget-item-date">${budget.date}</div>
      <div class="budget-item-actions">
        <button onclick="loadBudgetById('${budget.id}')">Load</button>
        <button onclick="deleteBudgetById('${budget.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

/**
 * Load a specific budget by ID
 */
export async function loadBudgetById(budgetId) {
  const regenerators = {
    headliners: () => window.regenerateHeadliners(),
    localDJs: () => window.regenerateLocalDJs(),
    cdjs: () => window.regenerateCDJs(),
    showRunners: () => window.regenerateShowRunners(),
    vendors: () => window.regenerateVendors(),
    otherCategories: () => window.regenerateOtherCategories(),
    otherItems: (c) => window.regenerateOtherItems(c)
  };

  await loadBudgetFromServer(budgetId, regenerators, updateBudget);
}

/**
 * Delete a budget with confirmation
 */
export async function deleteBudgetById(budgetId) {
  if (!confirm('Are you sure you want to delete this budget?')) {
    return;
  }

  try {
    await deleteBudgetFromServer(budgetId);
    alert('Budget deleted successfully');
    
    // Refresh the list
    if (document.getElementById('searchName')) {
      await handleSearchBudgets();
    }
    if (document.getElementById('budgetSelector')) {
      await initBudgetSelector();
    }
  } catch (error) {
    alert('Failed to delete budget: ' + error.message);
  }
}

/**
 * Generate CSV data from current form state
 */
function generateCSVData() {
  // Just call the same export logic as downloadCSV
  // We'll build the CSV the same way
  
  const rows = [];

  const csvCell = (v) => {
    const s = (v == null) ? "" : String(v);
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const pushKV = (label, value) => rows.push(`${label},${csvCell(value)}`);

  // Import FIELDS from state module - we need to access it
  // For now, let's rebuild it manually to match downloadCSV

  // CSV VERSION HEADER
  pushKV('XODIA_BUDGET_VERSION', '3');
  rows.push('');

  // BASIC INFO
  pushKV('Show Title', document.getElementById('showTitle')?.value || '');
  pushKV('Show Date', document.getElementById('showDate')?.value || '');
  rows.push('');

  // HEADLINERS
  rows.push('Headliners:');
  const numHeadliners = +document.getElementById('numHeadliners')?.value || 0;
  for (let i = 1; i <= numHeadliners; i++) {
    pushKV(`Headliner ${i} Fee`, document.getElementById(`headliner_fee_${i}`)?.value || '');
    pushKV(`Headliner ${i} Hotel`, document.getElementById(`headliner_hotel_${i}`)?.value || '');
    pushKV(`Headliner ${i} Rider`, document.getElementById(`headliner_rider_${i}`)?.value || '');
    pushKV(`Headliner ${i} Name`, document.getElementById(`headliner_name_${i}`)?.value || '');
  }
  rows.push('');

  // SUPPORT
  rows.push('Support:');
  pushKV('Direct Support Fee', document.getElementById('directSupport')?.value || '');
  const numLocalDJs = +document.getElementById('numLocalDJs')?.value || 0;
  for (let i = 1; i <= numLocalDJs; i++) {
    pushKV(`Local DJ ${i} Name`, document.getElementById(`localDJ_name_${i}`)?.value || '');
    pushKV(`Local DJ ${i} Fee`, document.getElementById(`localDJ_fee_${i}`)?.value || '');
  }
  rows.push('');

  // PRODUCTION
  rows.push('Production:');
  pushKV('VJ Fee', document.getElementById('vjFee')?.value || '');
  pushKV('Venue', document.getElementById('venue')?.value || '');
  pushKV('LED Wall', document.getElementById('ledWall')?.value || '');
  pushKV('Lights', document.getElementById('lights')?.value || '');
  pushKV('Lasers', document.getElementById('lasers')?.value || '');
  rows.push('');

  // GEAR RENTALS
  rows.push('Gear Rentals:');
  const numCDJs = +document.getElementById('numCDJs')?.value || 0;
  for (let i = 1; i <= numCDJs; i++) {
    pushKV(`CDJ ${i} Fee`, document.getElementById(`cdj_fee_${i}`)?.value || '');
  }
  pushKV('Sound', document.getElementById('sound')?.value || '');
  pushKV('Mixer', document.getElementById('mixer')?.value || '');
  pushKV('Table', document.getElementById('table')?.value || '');
  rows.push('');

  // MARKETING
  rows.push('Marketing:');
  pushKV('Facebook Ads XODIA', document.getElementById('facebookAdsXodia')?.value || '');
  pushKV('Facebook Ads SPACE CAMP HQ', document.getElementById('facebookAdsSpaceCampHQ')?.value || '');
  pushKV('Instagram Ads XODIA', document.getElementById('instagramAdsXodia')?.value || '');
  pushKV('Instagram Ads SPACE CAMP HQ', document.getElementById('instagramAdsSpaceCampHQ')?.value || '');
  pushKV('Physical Flyers', document.getElementById('physicalFlyers')?.value || '');
  pushKV('Eventbrite Ads', document.getElementById('eventbriteAds')?.value || '');
  rows.push('');

  // STAFF
  rows.push('Staff:');
  pushKV('Door Staff', document.getElementById('doorStaff')?.value || '');
  pushKV('Merch Table', document.getElementById('merchTable')?.value || '');
  pushKV('Transportation', document.getElementById('transportation')?.value || '');
  const numShowRunners = +document.getElementById('numShowRunners')?.value || 0;
  for (let i = 1; i <= numShowRunners; i++) {
    pushKV(`Show Runner ${i} Fee`, document.getElementById(`showRunner_fee_${i}`)?.value || '');
  }
  rows.push('');

  // OTHER CATEGORIES
  rows.push('Other Categories:');
  const numOtherCategories = +document.getElementById('numOtherCategories')?.value || 0;
  for (let c = 1; c <= numOtherCategories; c++) {
    const name = document.getElementById(`otherCategoryName_${c}`)?.value || '';
    const count = document.getElementById(`otherCategoryCount_${c}`)?.value || 0;

    pushKV(`Category ${c} Name`, name);
    pushKV(`Category ${c} Items Count`, count);

    for (let i = 1; i <= (+count || 0); i++) {
      pushKV(`Category ${c} Item ${i} Name`, document.getElementById(`otherCategory_${c}_itemName_${i}`)?.value || '');
      pushKV(`Category ${c} Item ${i} Fee`, document.getElementById(`otherCategory_${c}_itemFee_${i}`)?.value || '');
    }
  }
  rows.push('');

  // SALES
  rows.push('Sales:');
  pushKV('Eventbrite Sales', document.getElementById('eventbriteSales')?.value || '');
  pushKV('DJ Presales', document.getElementById('djPresales')?.value || '');
  pushKV('Promo Team', document.getElementById('promoTeam')?.value || '');
  pushKV('Door Sales', document.getElementById('doorSales')?.value || '');
  pushKV('Merch Sold', document.getElementById('merchSold')?.value || '');

  const numMerchVendors = +document.getElementById('numMerchVendors')?.value || 0;
  for (let i = 1; i <= numMerchVendors; i++) {
    pushKV(`Vendor ${i} Name`, document.getElementById(`merchVendor_name_${i}`)?.value || '');
    pushKV(`Vendor ${i} Fee`, document.getElementById(`merchVendor_fee_${i}`)?.value || '');
  }

  return rows.join('\n');
}

/**
 * Save current budget to server
 */
export async function handleSaveBudgetToServer() {
  const showTitle = document.getElementById('showTitle')?.value || 'Untitled Event';
  const showDate = document.getElementById('showDate')?.value || '';

  if (!showTitle || showTitle === 'Untitled Event') {
    alert('Please enter a show title before saving');
    return;
  }

  try {
    // Generate CSV data by triggering the download function and capturing it
    // This is a workaround - ideally we'd refactor downloadCSV to return the data
    const csvData = generateCSVData();

    const result = await saveBudgetToServer(csvData, {
      name: showTitle,
      date: showDate
    });

    alert('Budget saved to server successfully!');
    
    // Refresh selector if it exists
    if (document.getElementById('budgetSelector')) {
      await initBudgetSelector();
    }
  } catch (error) {
    alert('Failed to save budget: ' + error.message);
    console.error('Save error:', error);
  }
}

/**
 * Modal handlers
 */
export function openBudgetLoadModal() {
  const modal = document.getElementById('budgetLoadModal');
  if (modal) {
    modal.style.display = 'flex';
    loadModalBudgetList();
  }
}

export function closeBudgetLoadModal() {
  const modal = document.getElementById('budgetLoadModal');
  if (modal) modal.style.display = 'none';
}

async function loadModalBudgetList() {
  try {
    const budgets = await fetchBudgetList();
    displayModalBudgetList(budgets);
  } catch (error) {
    console.error('Error loading modal budget list:', error);
  }
}

function displayModalBudgetList(budgets) {
  const listContainer = document.getElementById('modalBudgetList');
  if (!listContainer) return;

  if (budgets.length === 0) {
    listContainer.innerHTML = '<p>No saved budgets found</p>';
    return;
  }

  listContainer.innerHTML = budgets.map(budget => `
    <div class="budget-item" onclick="loadBudgetAndCloseModal('${budget.id}')">
      <div class="budget-item-name">${budget.name}</div>
      <div class="budget-item-date">${budget.date}</div>
    </div>
  `).join('');
}

export async function loadBudgetAndCloseModal(budgetId) {
  await loadBudgetById(budgetId);
  closeBudgetLoadModal();
}

export async function handleModalSearch() {
  const searchTerm = document.getElementById('modalSearchName')?.value || '';
  
  try {
    const results = await searchBudgets({ name: searchTerm });
    displayModalBudgetList(results);
  } catch (error) {
    alert('Search failed: ' + error.message);
  }
}

// Make functions globally available for HTML onclick handlers
window.handleBudgetSelection = handleBudgetSelection;
window.handleLoadSelectedBudget = handleLoadSelectedBudget;
window.handleSearchBudgets = handleSearchBudgets;
window.loadBudgetById = loadBudgetById;
window.deleteBudgetById = deleteBudgetById;
window.handleSaveBudgetToServer = handleSaveBudgetToServer;
window.openBudgetLoadModal = openBudgetLoadModal;
window.closeBudgetLoadModal = closeBudgetLoadModal;
window.loadBudgetAndCloseModal = loadBudgetAndCloseModal;
window.handleModalSearch = handleModalSearch;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const selector = document.getElementById('budgetSelector');
  if (!selector) return;

  // Populate the dropdown first
  await initBudgetSelector();

  selector.addEventListener('change', async (e) => {
    handleBudgetSelection(e.target.value);
    await handleLoadSelectedBudget();
  });

  // Optional: if the selector already has a value (e.g., browser restores state)
  handleBudgetSelection(selector.value);
});



