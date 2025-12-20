// serverLoad.js - Load CSV budgets from server

import { loadCSV } from './csv.js';

// Your Pi5 server address
const API_BASE = 'https://192.168.1.217:3000';

export async function loadBudgetFromServer(budgetId, regenerators, updateBudgetFn) {
  const statusEl = document.getElementById('loadStatus');
  
  try {
    if (statusEl) statusEl.textContent = 'Loading budget...';
    
    const response = await fetch(`${API_BASE}/api/budgets/${budgetId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load budget: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    loadCSV(csvText, regenerators, updateBudgetFn);
    
    if (statusEl) {
      statusEl.textContent = 'Budget loaded successfully!';
      setTimeout(() => statusEl.textContent = '', 3000);
    }
    
  } catch (error) {
    console.error('Error loading budget:', error);
    if (statusEl) statusEl.textContent = `Error: ${error.message}`;
    alert(`Failed to load budget: ${error.message}`);
  }
}

export async function fetchBudgetList() {
  try {
    const response = await fetch(`${API_BASE}/api/budgets`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch budget list: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error fetching budget list:', error);
    throw error;
  }
}

export async function populateBudgetSelector(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const budgets = await fetchBudgetList();

    // Parse createdAt safely (fallbacks included)
    const getTs = (b) => {
      const raw = b?.createdAt ?? b?.updatedAt ?? b?.created_at ?? b?.timestamp;
      const ts = raw ? Date.parse(raw) : NaN;
      return Number.isFinite(ts) ? ts : 0;
    };

    // Sort newest first
    budgets.sort((a, b) => getTs(b) - getTs(a));

    // Keep the placeholder option at index 0; clear everything else
    select.length = 1;

    budgets.forEach((budget) => {
      const id = budget?.id ?? budget?._id ?? budget?.budgetId;
      if (!id) return; // cannot load without a stable id

      const name = budget?.name ?? "Untitled Budget";
      const date = budget?.date ?? "";

      const option = document.createElement("option");
      option.value = String(id);

      // Store raw fields for any other code that needs them (do NOT parse the label)
      option.dataset.name = name;
      option.dataset.date = date;
      option.dataset.createdAt = budget?.createdAt ?? "";

      const savedDate = new Date(option.dataset.createdAt);
      const timeStr = Number.isFinite(savedDate.getTime())
        ? savedDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Unknown time";

      option.textContent = date
        ? `${name} - ${date} (Saved: ${timeStr})`
        : `${name} (Saved: ${timeStr})`;

      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating budget selector:", error);
    alert("Failed to load budget list from server");
  }
}


export async function saveBudgetToServer(csvData, metadata = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csv: csvData,
        name: metadata.name || 'Untitled Budget',
        date: metadata.date || new Date().toISOString().split('T')[0],
        ...metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save budget: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error saving budget to server:', error);
    throw error;
  }
}

export async function searchBudgets(criteria) {
  try {
    const params = new URLSearchParams(criteria);
    const response = await fetch(`${API_BASE}/api/budgets/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error searching budgets:', error);
    throw error;
  }
}

export async function deleteBudgetFromServer(budgetId) {
  try {
    const response = await fetch(`${API_BASE}/api/budgets/${budgetId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete budget: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}




