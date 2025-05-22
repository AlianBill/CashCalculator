
let transactions = [];

const defaultCategories = [
  { name: "food", label: "Jídlo", icon: "🍔", isDefault: true },
  { name: "transport", label: "Doprava", icon: "🚗", isDefault: true },
  { name: "shopping", label: "Nákupy", icon: "🛒", isDefault: true },
  { name: "salary", label: "Výplata", icon: "💰", isDefault: true }
];

let userCategories = JSON.parse(localStorage.getItem("userCategories")) || [];
const defaultColors = JSON.parse(localStorage.getItem("defaultCategoryColors")) || {};
defaultCategories.forEach(cat => {
  if (defaultColors[cat.name]) {
    cat.color = defaultColors[cat.name];
  }
});

function getAllCategories() {
  return [...defaultCategories, ...userCategories];
}

function renderCategorySelectOptions() {
  const selects = [document.getElementById("category"), document.getElementById("categoryFilter")];
  const allCategories = getAllCategories();

  selects.forEach(select => {
    if (!select) return;
    select.innerHTML = "";

    if (select.id === "categoryFilter") {
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "Všechny";
      select.appendChild(allOption);
    }

    allCategories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = `${cat.icon} ${cat.label}`;
      select.appendChild(option);
    });
  });
}

let currentCategoryFilter = "all";       
let currentTypeFilter = "all"
let currentStatsType = "expense";

document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1;
  const itemsPerPage = 5;

  const modal = document.getElementById("transactionModal");
  const addTransactionBtn = document.getElementById("addTransactionBtn");
  const closeModal = document.querySelector(".close");
  const cancelTransaction = document.getElementById("cancelTransaction");
  const saveTransaction = document.getElementById("saveTransaction");
  const transactionList = document.getElementById("transactionList");
  const balanceElement = document.getElementById("balance");
  const exportBtn = document.getElementById("exportCsvBtn");
  const availableIcons = ["🍔", "🚗", "🛒", "💰", "🏠", "📚", "🎁", "🐶", "🍕", "🎮"];
  const iconOptionsContainer = document.getElementById("iconOptions");
  const hiddenIconInput = document.getElementById("newCategoryIcon");

  availableIcons.forEach(icon => {
    const btn = document.createElement("button");
    btn.textContent = icon;
    btn.type = "button";
    btn.addEventListener("click", () => {
      hiddenIconInput.value = icon;
      document.querySelectorAll("#iconOptions button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    iconOptionsContainer.appendChild(btn);
  });

  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  userCategories = JSON.parse(localStorage.getItem("userCategories")) || [];

  renderCategorySelectOptions();
  renderCategoryList();

  addTransactionBtn.addEventListener("click", () => {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
    document.getElementById("date").max = today;
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "food";
    document.getElementById("type").value = "expense";
    
    modal.style.display = "flex";
  
    setTimeout(() => {
      document.getElementById("amount").focus();
    }, 50);
  });

  document.getElementById("categoryFilter").addEventListener("change", function () {
    currentCategoryFilter = this.value;
    currentPage = 1;
    updateUI();
  });

  document.getElementById("typeFilter").addEventListener("change", function () {
    currentTypeFilter = this.value;
    updateUI();
  });

  document.getElementById("showExpensesBtn").addEventListener("click", () => {
    currentStatsType = "expense";
    toggleStatsButtons();
    updateStatsCharts(document.getElementById("monthSelect").value, currentStatsType);
  });
  
  document.getElementById("showIncomesBtn").addEventListener("click", () => {
    currentStatsType = "income";
    toggleStatsButtons();
    updateStatsCharts(document.getElementById("monthSelect").value, currentStatsType);
  });
  
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    clearModalFields();
  });

  cancelTransaction.addEventListener("click", () => {
    modal.style.display = "none";
    clearModalFields();
  });

  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });

  saveTransaction.addEventListener("click", function () {
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const finalAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!amount || !date) {
      alert("Vyplňte všechny údaje!");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (date > today) {
      alert("Datum nemůže být v budoucnosti!");
      return;
    }

    const transaction = {
      id: Date.now(),
      amount: finalAmount,
      category,
      date,
    };

    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
    loadMonthOptions();
    modal.style.display = "none";
  });

  exportBtn.addEventListener("click", function () {
    const headers = ["ID", "Částka", "Kategorie", "Datum"];
    const rows = transactions.map(t => [t.id, t.amount, t.category, t.date]);
    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transakce.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });


  function clearModalFields() {
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "food";
    document.getElementById("type").value = "expense";
  }

  function updateUI() {
    transactionList.innerHTML = "";
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = "";
  
    // 🔧 Сортируем все транзакции сначала
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
    // 🔍 Применяем фильтр (все / příjem / výdaj)
    let filteredTransactions = sortedTransactions;

    if (currentCategoryFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(t => t.category === currentCategoryFilter);
      }

    if (currentTypeFilter === "income") {
      filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
    } 
    else if (currentTypeFilter === "expense") {
      filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
    }
  
    // 💰 Обновляем баланс
    const totalBalance = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    balanceElement.textContent = `${totalBalance} Kč`;
  
    // 📄 Пагинация
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  
    // 🧾 Рендер транзакций
    pageItems.forEach((transaction, index) => {
      const li = document.createElement("li");
      li.className = `transaction-item ${transaction.amount < 0 ? "transaction-expense" : "transaction-income"}`;
      li.style.animationDelay = `${index * 0.1}s`;
    
      const fullCat = getAllCategories().find(c => c.name === transaction.category);
      const categoryLabel = fullCat ? fullCat.label : transaction.category;
    
      li.innerHTML = `
        <div class="transaction-left">
          <div class="category-icon">${getCategoryIcon(transaction.category)}</div>
          <div class="category-info">
            <strong>${categoryLabel}</strong>
            <small>${formatDate(transaction.date)}</small>
          </div>
        </div>
        <div class="transaction-right">
          <span class="transaction-amount">${transaction.amount} Kč</span>
          <button class="delete-btn" data-id="${transaction.id}">🗑️</button>
        </div>
      `;
      transactionList.appendChild(li);
    });
  
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        deleteTransaction(id);
      });
    });
  
    if (totalPages > 1) {
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.disabled = true;
        btn.addEventListener("click", () => {
          currentPage = i;
          updateUI();
        });
        paginationControls.appendChild(btn);
      }
    }
    updateBalanceSection();
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
    loadMonthOptions();
  }

  loadMonthOptions();
  updateUI();
});

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function getCategoryIcon(categoryName) {
  const found = getAllCategories().find(c => c.name === categoryName);
  return found ? found.icon : "💸";
}

function loadMonthOptions() {
  const monthSelect = document.getElementById("monthSelect");
  const monthsSet = new Set();

  transactions.forEach(t => {
    const [year, month] = t.date.split("-");
    monthsSet.add(`${year}-${month}`);
  });

  const sorted = Array.from(monthsSet).sort().reverse();
  monthSelect.innerHTML = "";

  sorted.forEach(monthStr => {
    const option = document.createElement("option");
    const [year, month] = monthStr.split("-");
    option.value = monthStr;
    option.textContent = `${month}.${year}`;
    monthSelect.appendChild(option);
  });

  if (sorted.length > 0) {
    monthSelect.value = sorted[0];
    updateStatsCharts(sorted[0], currentStatsType);
  }
}

document.getElementById("monthSelect").addEventListener("change", e => {
  updateStatsCharts(e.target.value, currentStatsType);
});

function toggleStatsButtons() {
  document.getElementById("showExpensesBtn").classList.toggle("active", currentStatsType === "expense");
  document.getElementById("showIncomesBtn").classList.toggle("active", currentStatsType === "income");
}

function updateStatsCharts(monthStr, type) {
  const filtered = transactions.filter(t => t.date.startsWith(monthStr));
  const data = type === "expense"
    ? filtered.filter(t => t.amount < 0)
    : filtered.filter(t => t.amount > 0);

  drawPieChart(data, "statsPieChart", "statsLegend");
  drawBarChart(data, "statsBarChart");

  renderBarLegend("barLegendContainer", data);

  document.getElementById("pieTitle").textContent = type === "expense"
    ? "Výdaje podle kategorií"
    : "Příjmy podle kategorií";

  document.getElementById("barTitle").textContent = type === "expense"
    ? "Výdaje po dnech"
    : "Příjmy po dnech";
}

function drawPieChart(data, svgId, legendId) {
  const svg = document.getElementById(svgId);
  const legend = document.getElementById(legendId);
  svg.innerHTML = "";
  legend.innerHTML = "";

  const categorySums = {};
  let total = 0;

  data.forEach(t => {
    const cat = t.category;
    const value = Math.abs(t.amount);
    categorySums[cat] = (categorySums[cat] || 0) + value;
    total += value;
  });

  if (total === 0) return;

  const centerX = 100, centerY = 100, radius = 100;
  let startAngle = 0;
  const entries = Object.entries(categorySums);

  entries.forEach(([category, value], i) => {
    const angle = (value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    const catObj = getAllCategories().find(c => c.name === category);
    const color = catObj?.color || "#9C27B0";

    path.setAttribute("d", pathData);
    path.setAttribute("fill", color);
    path.setAttribute("stroke", "#fff");
    path.setAttribute("stroke-width", "1");
    svg.appendChild(path);

    const percent = ((value / total) * 100).toFixed(1);
    legend.appendChild(createLegendItem(color, category, percent, value));

    startAngle = endAngle;
  });

  if (entries.length === 1) {
    svg.innerHTML = "";
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const catObj = getAllCategories().find(c => c.name === entries[0][0]);
    const color = catObj?.color || "#9C27B0";
    circle.setAttribute("cx", centerX);
    circle.setAttribute("cy", centerY);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", color);
    svg.appendChild(circle);
  }
}

function renderBarLegend(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const categories = [...new Set(data.map(t => t.category))];

  categories.forEach(category => {
    const catObj = getAllCategories().find(c => c.name === category);
    const color = catObj?.color || "#9C27B0";

    const div = document.createElement("div");
    div.className = "bar-legend-item";
    div.innerHTML = `
      <span class="bar-legend-color" style="background-color: ${color}"></span>
      ${catObj?.label || category}
    `;
    container.appendChild(div);
  });
}



function drawBarChart(data, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const daysMap = {};

  data.forEach(t => {
    const day = parseInt(t.date.split("-")[2], 10);
    if (!daysMap[day]) daysMap[day] = [];
    daysMap[day].push(t);
  });

  const sortedDays = Object.keys(daysMap).sort((a, b) => a - b);
  const max = Math.max(...sortedDays.map(day =>
    daysMap[day].reduce((sum, t) => sum + Math.abs(t.amount), 0)
  ));

  const barWidth = 24;
  const spacing = 16;
  const chartPadding = 40;
  const chartHeight = canvas.height - chartPadding * 2;

  sortedDays.forEach((day, index) => {
    const transactions = daysMap[day];
    const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const x = index * (barWidth + spacing) + chartPadding;
    let y = canvas.height - chartPadding;

    transactions.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    transactions.forEach(t => {
      const value = Math.abs(t.amount);
      const height = (value / max) * chartHeight;
      const catObj = getAllCategories().find(c => c.name === t.category);
      const color = catObj?.color || "#9C27B0";

      y -= height;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, height);
    });

    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${total} Kč`, x + barWidth / 2, y - 6);

    ctx.fillStyle = "#555";
    ctx.fillText(day, x + barWidth / 2, canvas.height - 15);
  });
}




function createLegendItem(color, category, percent, sum) {
  const div = document.createElement("div");
  div.className = "legend-item";

  const colorBox = document.createElement("span");
  colorBox.className = "legend-color";
  colorBox.style.backgroundColor = color;

  const text = document.createTextNode(`${category}: ${percent}% (${sum} Kč)`);

  div.appendChild(colorBox);
  div.appendChild(text);
  return div;
}

document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.textContent.trim();
    showSection(target);
  });
});

function updateBalanceSection() {
  const incomes = transactions.filter(t => t.amount > 0);
  const expenses = transactions.filter(t => t.amount < 0);

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const progressPercent = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  const incomeEl = document.getElementById("totalIncome");
  const expenseEl = document.getElementById("totalExpense");
  const progressFillEl = document.getElementById("progressFill");
  const progressLabelEl = document.getElementById("progressLabel");
  const topListEl = document.getElementById("topTransactions");

  if (!incomeEl || !expenseEl || !progressFillEl || !progressLabelEl || !topListEl) return;


  progressFillEl.style.width = `${progressPercent}%`;

  const red = Math.min(255, Math.floor((progressPercent / 100) * 255));
  const green = Math.max(0, 255 - red);
  progressFillEl.style.backgroundColor = `rgb(${red}, ${green}, 80)`;
  
  progressLabelEl.textContent =
    progressPercent > 100 ? `🔥 ${progressPercent.toFixed(1)}%` : `${progressPercent.toFixed(1)}%`;
  
  incomeEl.textContent = `${totalIncome} Kč`;
  expenseEl.textContent = `${totalExpense} Kč`;

  const topTransactions = [...transactions]
  .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  .slice(0, 5);

  const topList = document.getElementById("topTransactions");
  topList.innerHTML = "";

  topTransactions.forEach(t => {
    const fullCat = getAllCategories().find(c => c.name === t.category);
    const categoryLabel = fullCat ? fullCat.label : t.category;
  
    const li = document.createElement("li");
    li.className = `top-transaction-card ${t.amount < 0 ? "expense" : "income"}`;
  
    li.innerHTML = `
      <div class="top-transaction-left">
        <div class="top-transaction-amount">${t.amount} Kč</div>
        <div class="top-transaction-category">${getCategoryIcon(t.category)} ${categoryLabel}</div>
        <div class="top-transaction-date">${formatDate(t.date)}</div>
      </div>
    `;
  
    topList.appendChild(li);
  });
  
}

function showSection(target) {
  document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
  // alert(target)
  if (target === "🏠 Domů") document.querySelector(".transactions").style.display = "block";
  if (target === "📈 Statistiky") document.getElementById("statsPage").style.display = "block";
  if (target === "💳 Balanc") document.getElementById("balancPage").style.display = "block";
  if (target === "⚙️ Nastavení") document.getElementById("settingsPage").style.display = "block";
}

// === Kategorie – nastavení ===

function saveCategories() {
  const all = [...defaultCategories, ...userCategories];
  localStorage.setItem("allCategories", JSON.stringify(all));
}

function renderCategoryList() {
  const listEl = document.getElementById("categoryList");
  if (!listEl) return;

  listEl.innerHTML = "";

  [...defaultCategories, ...userCategories].forEach(cat => {
    const li = document.createElement("li");
    li.className = "category-item";

    const icon = document.createElement("span");
    icon.textContent = cat.icon;

    const name = document.createElement("span");
    name.textContent = cat.name;
    name.className = "category-name";

    li.appendChild(icon);
    li.appendChild(name);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = cat.color || "#9C27B0";
    colorInput.addEventListener("input", () => {
      cat.color = colorInput.value;
    
      if (!cat.isDefault) {
        localStorage.setItem("userCategories", JSON.stringify(userCategories));
      } else {
        const defaultColors = JSON.parse(localStorage.getItem("defaultCategoryColors")) || {};
        defaultColors[cat.name] = cat.color;
        localStorage.setItem("defaultCategoryColors", JSON.stringify(defaultColors));
      }
    
      renderCategorySelectOptions();
      updateUI();
      loadMonthOptions();
    });
    
    li.appendChild(colorInput);

    // Только для пользовательских категорий
    if (!cat.isDefault) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.addEventListener("click", () => {
        userCategories = userCategories.filter(c => c.name !== cat.name);
        localStorage.setItem("userCategories", JSON.stringify(userCategories));
        renderCategoryList();
        renderCategorySelectOptions();
      });
      li.appendChild(delBtn);
    }

    listEl.appendChild(li);
  });
}




document.getElementById("addCategoryBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("newCategoryName");
  const iconInput = document.getElementById("newCategoryIcon");
  const name = nameInput.value.trim();
  const icon = iconInput.value.trim() || "📁";

  if (!name) {
    alert("Zadejte název kategorie.");
    return;
  }

  if (getAllCategories().some(c => c.name === name)) {
    alert("Tato kategorie už existuje.");
    return;
  }

  userCategories.push({ name, label: name, icon, isDefault: false });
  localStorage.setItem("userCategories", JSON.stringify(userCategories));

  nameInput.value = "";
  iconInput.value = "";
  renderCategoryList();
  renderCategorySelectOptions();
});

document.getElementById("clearCategoriesBtn").addEventListener("click", () => {
  if (confirm("Opravdu chcete smazat všechny uživatelské kategorie?")) {
    userCategories = [];
    localStorage.setItem("userCategories", JSON.stringify(userCategories));
    renderCategoryList();
    renderCategorySelectOptions();
  }
});


document.getElementById("exportCategoriesBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(userCategories, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "user_categories.json";
  link.click();
});


document.getElementById("importCategoriesInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data)) {
        userCategories = data.filter(c => !defaultCategories.some(d => d.name === c.name));
        localStorage.setItem("userCategories", JSON.stringify(userCategories));
        renderCategoryList();
        renderCategorySelectOptions();
      } else {
        alert("Neplatný formát souboru.");
      }
    } catch {
      alert("Chyba při načítání souboru.");
    }
    document.getElementById("importCategoriesInput").value = ""; // сбрасываем выбранный файл
  };
  reader.readAsText(file);
});


if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/js/sw.js").then(reg => {
    console.log("Service Worker zaregistrován:", reg.scope);
  }).catch(err => {
    console.log("Chyba při registraci Service Workeru:", err);
  });
}
