function formatDate(dateStr) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  
  function getCategoryIcon(categoryName) {
    const found = getAllCategories().find(c => c.name === categoryName);
    return found ? found.icon : "💸";
  }
  
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getAllCategories() {
    return [...defaultCategories, ...userCategories];
  }

  function setupSidebarNavigation() {
    document.querySelectorAll(".sidebar a").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const href = link.getAttribute("href");
        history.pushState({}, "", href);
        showSectionByPath(href);
      });
    });
  }

  

  
function showSectionByPath(path) {
  document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");

  switch (path) {
    case "/":
    case "/home":
      document.querySelector(".transactions").style.display = "block";
      break;
    case "/stats":
      document.getElementById("statsPage").style.display = "block";
      break;
    case "/balance":
      document.getElementById("balancPage").style.display = "block";
      break;
    case "/settings":
      document.getElementById("settingsPage").style.display = "block";
      break;
    default:
      document.querySelector(".transactions").style.display = "block";
  }
}

  
  function toggleStatsButtons() {
    document.getElementById("showExpensesBtn").classList.toggle("active", currentStatsType === "expense");
    document.getElementById("showIncomesBtn").classList.toggle("active", currentStatsType === "income");
  }
  