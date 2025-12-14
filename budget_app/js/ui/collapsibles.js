// js/ui/collapsibles.js
// UI collapsible helpers (works with your current HTML: onclick="toggleCollapse('col_headliners')")

export function toggleCollapse(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.classList.toggle("open");
}

export function setCollapseOpen(id, open = true) {
  const section = document.getElementById(id);
  if (!section) return;
  section.classList.toggle("open", !!open);
}

/**
 * Backward-compatible autoExpand:
 * - If sectionOrCollapseId is a real collapsible container ID (e.g., "col_support"), it opens it.
 * - If you pass legacy IDs (sectionID/headerID), it will attempt the old dataset/inline-text logic too.
 */
export function autoExpand(sectionOrCollapseId, headerId = null) {
  // Preferred (your current app): collapsible container IDs like "col_support"
  const maybeCollapse = document.getElementById(sectionOrCollapseId);
  if (maybeCollapse && maybeCollapse.classList && maybeCollapse.classList.contains("collapsible")) {
    maybeCollapse.classList.add("open");
    return;
  }

  // Legacy fallback (safe no-op if not present)
  const header = headerId ? document.getElementById(headerId) : null;
  const body = document.getElementById(sectionOrCollapseId);

  if (header && body) {
    header.dataset.open = "true";
    if (header.dataset.label) header.textContent = "▾ " + header.dataset.label;
    body.style.display = "block";
  }
}

// Optional legacy helpers (kept for compatibility if you still have header/body collapsibles somewhere)
export const collapsibleSections = [
  { header: "header_headliners", body: "section_headliners" },
  { header: "header_support", body: "section_support" },
  { header: "header_production", body: "section_production" },
  { header: "header_gear", body: "section_gear" },
  { header: "header_marketing", body: "section_marketing" },
  { header: "header_staff", body: "section_staff" },
  { header: "header_otherCats", body: "section_otherCats" }
];

export function toggleSection(headerID, bodyID) {
  const header = document.getElementById(headerID);
  const body = document.getElementById(bodyID);
  if (!header || !body) return;

  const isOpen = header.dataset.open === "true";
  if (isOpen) {
    header.dataset.open = "false";
    if (header.dataset.label) header.textContent = "▸ " + header.dataset.label;
    body.style.display = "none";
  } else {
    header.dataset.open = "true";
    if (header.dataset.label) header.textContent = "▾ " + header.dataset.label;
    body.style.display = "block";
  }
}

export function initCollapsibles() {
  collapsibleSections.forEach(sec => {
    const header = document.getElementById(sec.header);
    const body = document.getElementById(sec.body);
    if (!header || !body) return;

    header.dataset.open = "true";
    if (header.dataset.label) header.textContent = "▾ " + header.dataset.label;
    body.style.display = "block";

    header.addEventListener("click", () => toggleSection(sec.header, sec.body));
  });
}
