// === Globální proměnné ===

let transactions = [];
let userCategories = JSON.parse(localStorage.getItem("userCategories")) || [];
let currentCategoryFilter = "all";
let currentTypeFilter = "all";
let currentStatsType = "expense";

const defaultCategories = [
  { name: "Jídlo", label: "Jídlo", icon: "🍔", isDefault: true },
  { name: "Doprava", label: "Doprava", icon: "🚗", isDefault: true },
  { name: "Nákupy", label: "Nákupy", icon: "🛒", isDefault: true },
  { name: "Výplata", label: "Výplata", icon: "💰", isDefault: true }
];

// === Načtení barev pro výchozí kategorie ===

const defaultColors = JSON.parse(localStorage.getItem("defaultCategoryColors")) || {};
defaultCategories.forEach(cat => {
  if (defaultColors[cat.name]) {
    cat.color = defaultColors[cat.name];
  }
});

// === Spuštění po načtení DOM ===

document.addEventListener("DOMContentLoaded", () => {
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  userCategories = JSON.parse(localStorage.getItem("userCategories")) || [];

  renderCategorySelectOptions();
  renderCategoryList();
  loadMonthOptions();
  updateUI();

  setupSidebarNavigation();
  setupMainEventListeners();

});

window.addEventListener("popstate", () => {
  showSectionByPath(location.pathname);
});

if ("serviceWorker" in navigator) {
  const path = `${location.pathname.replace(/\/[^\/]*$/, '')}/js/sw.js`;

  navigator.serviceWorker.register(path)
    .then(reg => {
      console.log("Service Worker zaregistrován:", reg.scope);
    })
    .catch(err => {
      console.log("Chyba při registraci Service Workeru:", err);
    });
}

