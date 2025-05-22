

document.getElementById("monthSelect").addEventListener("change", e => {
  updateStatsCharts(e.target.value, currentStatsType);
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
    console.log("renderBarLegend")
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
    console.log("renderBarLegend")
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
