let entries = JSON.parse(localStorage.getItem("entries")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let chart, barChart;

// document.addEventListener("DOMContentLoaded", () => {
//   document.getElementById("date").valueAsDate = new Date();
//   applyTheme();
updateCategoryUI();
//   updateUI();
// });
function initApp() {
  const loadingMsg = document.getElementById("loading-message");
  if (loadingMsg) loadingMsg.remove(); // Remove once loaded

  const dateInput = document.getElementById("date");
  //   const catList = document.getElementById("category-list");
  //   const dataList = document.getElementById("categoryList");

  if (!dateInput) {
    //   if (!dateInput || !catList || !dataList) {
    console.warn("⏳ DOM not ready yet. Retrying in 100ms...");
    setTimeout(initApp, 100);
    return;
  }

  dateInput.valueAsDate = new Date();
  applyTheme();
  updateCategoryUI();
  updateUI();
  onFilterChange(); // Ensure dropdowns load correctly

}

document.addEventListener("DOMContentLoaded", initApp);

function showNameSuggestions() {
  const input = document.getElementById("name");
  const dropdown = document.getElementById("name-suggestions");
  const value = input.value.toLowerCase();
  const uniqueNames = [...new Set(entries.map(e => e.name))];
  const matches = uniqueNames.filter(n => n.toLowerCase().includes(value));

  dropdown.innerHTML = "";
  matches.forEach(name => {
    const div = document.createElement("div");
    div.textContent = name;
    div.onclick = () => {
      input.value = name;
      dropdown.style.display = "none";
    };
    dropdown.appendChild(div);
  });
  dropdown.style.display = matches.length ? "block" : "none";
}
function showCategorySuggestions() {
  const input = document.getElementById("category");
  const dropdown = document.getElementById("category-suggestions");
  const value = input.value.toLowerCase();
  const matches = categories.filter(c => c.toLowerCase().includes(value));

  dropdown.innerHTML = "";
  matches.forEach(cat => {
    const div = document.createElement("div");
    div.textContent = cat;
    div.onclick = () => {
      input.value = cat;
      dropdown.style.display = "none";
    };
    dropdown.appendChild(div);
  });
  dropdown.style.display = matches.length ? "block" : "none";
}
// function showSearchSuggestions() {
//   const input = document.getElementById("search");
//   const dropdown = document.getElementById("search-suggestions");
//   const value = input.value.toLowerCase();

//   const combined = [...new Set(
//     entries.flatMap(e => [e.name, e.category]).filter(x => typeof x === "string")
//   )];

//   const matches = combined.filter(x => x.toLowerCase().includes(value));

//   dropdown.innerHTML = "";
//   matches.forEach(match => {
//     const div = document.createElement("div");
//     div.textContent = match;
//     div.onclick = () => {
//       input.value = match;
//       dropdown.style.display = "none";
//       updateUI();
//     };
//     dropdown.appendChild(div);
//   });

//   dropdown.style.display = matches.length ? "block" : "none";
// }
function showSearchSuggestions() {
  const input = document.getElementById("search");
  const dropdown = document.getElementById("search-suggestions");
  const clearBtn = document.getElementById("clear-search-btn");
  const value = input.value.toLowerCase();

  // Show clear button if input is not empty
  clearBtn.style.display = value ? "block" : "none";

  const combined = [...new Set(entries.flatMap(e => [e.name, e.category]))];
  const matches = combined.filter(x => x.toLowerCase().includes(value));

  dropdown.innerHTML = "";
  matches.forEach(match => {
    const div = document.createElement("div");
    div.textContent = match;
    div.onclick = () => {
      input.value = match;
      dropdown.style.display = "none";
      clearBtn.style.display = "block";
      updateUI();
    };
    dropdown.appendChild(div);
  });

  dropdown.style.display = matches.length ? "block" : "none";
}
function clearSearch() {
  document.getElementById("search").value = "";
  document.getElementById("search-suggestions").style.display = "none";
  document.getElementById("clear-search-btn").style.display = "none";
  updateUI(); // Show all entries
}


document.addEventListener("click", (e) => {
  const ids = ["name-suggestions", "category-suggestions", "search-suggestions"];
  ids.forEach(id => {
    const box = document.getElementById(id);
    if (!box.contains(e.target) && !document.getElementById(id.replace("-suggestions", "")).contains(e.target)) {
      box.style.display = "none";
    }
  });
});

function onFilterChange() {
  const filter = document.getElementById("filter").value;
  const yearSelect = document.getElementById("year-select");
  const monthYearSelect = document.getElementById("month-year-select");

  yearSelect.style.display = "none";
  monthYearSelect.style.display = "none";

  if (filter === "by-year") {
    populateYearSelect();
    yearSelect.style.display = "inline-block";
  } else if (filter === "by-month-year") {
    populateMonthYearSelect();
    monthYearSelect.style.display = "inline-block";
  }

  updateUI();
}

function populateYearSelect() {
  const select = document.getElementById("year-select");
  select.innerHTML = "";

  const currentYear = new Date().getFullYear();

  // Determine the earliest year from entries
  const startYear = entries.length
    ? new Date(Math.min(...entries.map(e => new Date(e.date).getTime()))).getFullYear()
    : currentYear; // fallback if no entries

  for (let y = currentYear; y >= startYear; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    select.appendChild(opt);
  }
}


function populateMonthYearSelect() {
  const select = document.getElementById("month-year-select");
  select.innerHTML = "";

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Find the earliest entry date
  let earliest = entries.length
    ? new Date(Math.min(...entries.map(e => new Date(e.date).getTime())))
    : new Date(currentDate.getFullYear(), 0); // fallback: Jan of current year

  const startYear = earliest.getFullYear();
  const startMonth = earliest.getMonth();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let y = currentYear; y >= startYear; y--) {
    const maxMonth = y === currentYear ? currentMonth : 11;
    const minMonth = y === startYear ? startMonth : 0;
    for (let m = maxMonth; m >= minMonth; m--) {
      const opt = document.createElement("option");
      opt.value = `${y}-${m}`;
      opt.textContent = `${months[m]} ${y}`;
      select.appendChild(opt);
    }
  }
}




function addEntry() {
  const name = document.getElementById("name").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value.trim();
  const dateInput = document.getElementById("date").value;
  const date = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
  const description = document.getElementById("description").value.trim();

  if (!name || isNaN(amount) || amount <= 0 || !category) {
    alert("Please enter all fields.");
    return;
  }

  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem("categories", JSON.stringify(categories));
  }

  entries.push({ name, amount, type, category, date, description });
  localStorage.setItem("entries", JSON.stringify(entries));

  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
  document.getElementById("type").value = "income";
  document.getElementById("date").valueAsDate = new Date();

  updateCategoryUI();
  updateUI();
}

// function updateCategoryUI() {
//     alert("loaded");
//     // const datalist = document.getElementById("categoryList");
//     // const list = document.getElementById("category-list");
//     // datalist.innerHTML = "";
//     // list.innerHTML = "";

//     categories.forEach((cat, index) => {
//         const opt = document.createElement("option");
//         opt.value = cat;
//         datalist.appendChild(opt);

//         const li = document.createElement("li");
//         li.innerHTML = `${cat} <button onclick="deleteCategory(${index})">x</button>`;
//         list.appendChild(li);
//     });
// }
function updateCategoryUI() {
  const list = document.getElementById("category-list");
  list.innerHTML = "";

  categories.forEach((cat, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${cat} <button onclick="deleteCategory(${index})">x</button>`;
    list.appendChild(li);
  });
}


function deleteCategory(index) {
  const name = categories[index];
  if (confirm(`Delete category "${name}"?`)) {
    categories.splice(index, 1);
    entries = entries.filter(e => e.category !== name);
    localStorage.setItem("entries", JSON.stringify(entries));
    localStorage.setItem("categories", JSON.stringify(categories));
    updateCategoryUI();
    updateUI();
  }
}

function deleteEntry(index) {
  if (confirm("Delete this entry?")) {
    entries.splice(index, 1);
    localStorage.setItem("entries", JSON.stringify(entries));
    updateUI();
  }
}

function updateUI() {
  const filter = document.getElementById("filter").value;
  const yearSelect = document.getElementById("year-select");
  const monthYearSelect = document.getElementById("month-year-select");
  const search = document.getElementById("search").value.toLowerCase();

  const entryList = document.getElementById("entry-list");
  const incomeDisplay = document.getElementById("income");
  const expenseDisplay = document.getElementById("expense");
  const balanceDisplay = document.getElementById("balance");
  const noDataMsg = document.getElementById("no-data-msg");
  const chartCanvas = document.getElementById("chart").parentElement;
  const barCanvas = document.getElementById("barChart").parentElement;

  const now = new Date();

  const filtered = entries.filter(e => {
    const d = new Date(e.date);
    if (isNaN(d)) return false;

    const yearDiff = now.getFullYear() - d.getFullYear();
    const monthDiff = yearDiff * 12 + (now.getMonth() - d.getMonth());

    let matchFilter = false;
    if (filter === "this-month") {
      matchFilter = monthDiff === 0;
    } else if (filter === "last-3-months") {
      matchFilter = monthDiff >= 0 && monthDiff <= 2;
    } else if (filter === "last-6-months") {
      matchFilter = monthDiff >= 0 && monthDiff <= 5;
    } else if (filter === "last-12-months") {
      matchFilter = monthDiff >= 0 && monthDiff <= 11;
    } else if (filter === "by-year") {
      const selectedYear = parseInt(yearSelect.value);
      matchFilter = d.getFullYear() === selectedYear;
    } else if (filter === "by-month-year") {
      const [selectedYear, selectedMonth] = monthYearSelect.value.split("-").map(Number);
      matchFilter = d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    }

    return matchFilter && (
      e.name.toLowerCase().includes(search) ||
      e.category.toLowerCase().includes(search)
    );
  });

  // Show/hide no data message and chart visibility
  const hasData = filtered.length > 0;
  noDataMsg.style.display = hasData ? "none" : "block";
  document.getElementById("chart").style.display = hasData ? "block" : "none";
  document.getElementById("barChart").style.display = hasData ? "block" : "none";
  document.getElementById("search-drp").style.display = hasData ? "block" : "none";
  document.getElementById("entry-list-title").style.display = hasData ? "block" : "none";

  let income = 0, expense = 0;
  entryList.innerHTML = "";

  filtered.forEach((e, i) => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;

    const li = document.createElement("li");
    li.className = `entry-card ${e.type}`;

    const dateObj = new Date(e.date);
    const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

    li.onclick = () => showPopup(e, i);  // Add this
    li.innerHTML = `
        <div class="entry-info">
          <div class="entry-name">${e.name}</div>
          <div class="entry-details">${dateStr} • ${e.category}</div>
        </div>
        <div class="entry-amount">${e.type === "income" ? "+" : "-"}₹${e.amount}</div>
        `;
        
        // <button class="entry-delete" onclick="event.stopPropagation(); deleteEntry(${i})">🗑</button>

    entryList.appendChild(li);
  });

  incomeDisplay.textContent = income.toFixed(2);
  expenseDisplay.textContent = expense.toFixed(2);
  balanceDisplay.textContent = (income - expense).toFixed(2);

  if (hasData) {
    updatePieChart(income, expense);
    updateBarChart(filtered);
  } else {
    if (chart) chart.destroy();
    if (barChart) barChart.destroy();
  }
}1013242

function showPopup(entry, index) {
  document.getElementById('popup-name').textContent = entry.name;
  document.getElementById('popup-category').textContent = entry.category;
  document.getElementById('popup-amount').textContent = `${entry.type === 'income' ? '+' : '-'}₹${entry.amount}`;
  const dateObj = new Date(entry.date);
  const options = { weekday: 'long' }; // gives you day like "Wednesday"
  const dayName = dateObj.toLocaleDateString(undefined, options);
  const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

  document.getElementById('popup-date').textContent = `${dayName}, ${formattedDate}`;
  document.getElementById('popup-description').textContent = entry.description || 'No description';

  const deleteBtn = document.getElementById('popup-delete-btn');
  deleteBtn.onclick = () => {
    deleteEntry(index);
    closePopup();
  };

  document.getElementById('entry-popup').style.display = 'flex';
}

function closePopup(event) {
  document.getElementById('entry-popup').style.display = 'none';
}




function updatePieChart(income, expense) {
  const ctx = document.getElementById("chart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#00b894", "#d63031"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function updateBarChart(entries) {
  // console.log(entries);
  const ctx = document.getElementById("barChart").getContext("2d");

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  entries.forEach(e => {
    const d = new Date(e.date);
    const monthIndex = d.getMonth(); // 0 = Jan, 11 = Dec
    if (e.type === "income") monthlyIncome[monthIndex] += e.amount;
    else monthlyExpense[monthIndex] += e.amount;
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        { label: "Income", backgroundColor: "#00b894", data: monthlyIncome },
        { label: "Expense", backgroundColor: "#d63031", data: monthlyExpense }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } }
    }
  });
}


function exportData() {
  const data = { entries, categories };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expense_data.json";
  link.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);

      if (!parsed.entries || !Array.isArray(parsed.entries)) {
        alert("❌ Invalid file: Missing or malformed 'entries'");
        return;
      }

      // ✅ Assign to global variables
      entries = parsed.entries;
      categories = Array.isArray(parsed.categories) ? parsed.categories : [];

      // ✅ Save to localStorage
      localStorage.setItem("entries", JSON.stringify(entries));
      localStorage.setItem("categories", JSON.stringify(categories));

      // ✅ Force reload
      updateCategoryUI();
      updateUI();

      alert("✅ Data imported successfully!");
    } catch (err) {
      alert("❌ Failed to import: Invalid JSON format.");
      console.error("Import Error:", err);
    }
  };

  reader.readAsText(file);
}



function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark ? "1" : "0");
}

function applyTheme() {
  if (localStorage.getItem("darkMode") === "1") {
    document.body.classList.add("dark");
  }
}
function toggleMenu() {
  document.body.classList.toggle("menu-open");
}
