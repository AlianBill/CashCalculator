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
  
    // 🌡️ Заполнение прогресс-бара и изменение цвета
    progressFillEl.style.width = `${progressPercent}%`;
    const red = Math.min(255, Math.floor((progressPercent / 100) * 255));
    const green = Math.max(0, 255 - red);
    progressFillEl.style.backgroundColor = `rgb(${red}, ${green}, 80)`;
  
    progressLabelEl.textContent =
      progressPercent > 100 ? `🔥 ${progressPercent.toFixed(1)}%` : `${progressPercent.toFixed(1)}%`;
  
    incomeEl.textContent = `${totalIncome} Kč`;
    expenseEl.textContent = `${totalExpense} Kč`;
  
    // 🥇 Топ-5 транзакций
    const topTransactions = [...transactions]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
  
    topListEl.innerHTML = "";
  
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
  
      topListEl.appendChild(li);
    });
  }
  