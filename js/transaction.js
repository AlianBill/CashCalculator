function setupMainEventListeners() {
    const modal = document.getElementById("transactionModal");
    const addTransactionBtn = document.getElementById("addTransactionBtn");
    const closeModal = document.querySelector(".close");
    const cancelTransaction = document.getElementById("cancelTransaction");
    const saveTransaction = document.getElementById("saveTransaction");
  
    addTransactionBtn.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("date").value = today;
      document.getElementById("date").max = today;
      document.getElementById("amount").value = "";
      document.getElementById("category").value = "Jídlo";
      document.getElementById("type").value = "expense";
  
      modal.style.display = "flex";
  
      setTimeout(() => {
        document.getElementById("amount").focus();
      }, 50);
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
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  
    saveTransaction.addEventListener("click", () => {
      const amount = parseFloat(document.getElementById("amount").value);
      const type = document.getElementById("type").value;
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
  
      const finalAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);
  
      const transaction = {
        id: Date.now(),
        amount: finalAmount,
        category,
        date
      };
  
      transactions.push(transaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
      updateUI();
      loadMonthOptions();
      modal.style.display = "none";
    });
  }
  
  function clearModalFields() {
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "food";
    document.getElementById("type").value = "expense";
  }
  