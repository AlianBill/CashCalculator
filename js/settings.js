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
  
  document.getElementById("addCategoryBtn")?.addEventListener("click", () => {
    const nameInput = document.getElementById("newCategoryName");
    const iconInput = document.getElementById("newCategoryIcon");
    const name = nameInput.value.trim();
    const icon = iconInput.value.trim() || "📁";
  
    if (!name) return alert("Zadejte název kategorie.");
    if (getAllCategories().some(c => c.name === name)) return alert("Tato kategorie už existuje.");
  
    const color = getRandomColor();
    userCategories.push({ name, label: name, icon, color, isDefault: false });
    localStorage.setItem("userCategories", JSON.stringify(userCategories));
  
    nameInput.value = "";
    iconInput.value = "";
    renderCategoryList();
    renderCategorySelectOptions();
  });
  
  document.getElementById("clearCategoriesBtn")?.addEventListener("click", () => {
    if (confirm("Opravdu chcete smazat všechny uživatelské kategorie?")) {
      userCategories = [];
      localStorage.setItem("userCategories", JSON.stringify(userCategories));
      renderCategoryList();
      renderCategorySelectOptions();
    }
  });
  
  document.getElementById("exportCategoriesBtn")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(userCategories, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "user_categories.json";
    link.click();
  });
  
  document.getElementById("importCategoriesInput")?.addEventListener("change", (e) => {
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
      document.getElementById("importCategoriesInput").value = "";
    };
    reader.readAsText(file);
  });
  