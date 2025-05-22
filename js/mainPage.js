
let currentPage = 1;
const itemsPerPage = 5;

function updateUI() {
  const transactionList = document.getElementById("transactionList");
  const balanceElement = document.getElementById("balance");
  const paginationControls = document.getElementById("paginationControls");

  transactionList.innerHTML = "";
  paginationControls.innerHTML = "";

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    return dateDiff !== 0 ? dateDiff : b.id - a.id;
  });

  let filteredTransactions = sortedTransactions;
  if (currentCategoryFilter !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.category === currentCategoryFilter);
  }
  if (currentTypeFilter === "income") {
    filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
  } else if (currentTypeFilter === "expense") {
    filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
  }

  const totalBalance = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  balanceElement.textContent = `${totalBalance} Kč`;

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

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

document.getElementById("categoryFilter").addEventListener("change", function () {
  currentCategoryFilter = this.value;
  currentPage = 1;
  updateUI();
});

document.getElementById("typeFilter").addEventListener("change", function () {
  currentTypeFilter = this.value;
  updateUI();
});
