// DOM Elements
const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const clearBtn = document.getElementById("clear");
const taskContainer = document.getElementById("task");

const totalIncomeEl = document.getElementById("totalBalance");
const totalExpenseEl = document.getElementById("totalExpenses");
const netBalanceEl = document.getElementById("netBalance");
const filterRadios = document.querySelectorAll("input[name='filter']");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;

//Add / Update Transaction
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const type = typeSelect.value;

  if (!desc || isNaN(amount)) {
    alert("Please enter valid description and amount");
    return;
  }

  if (editId !== null) {
    transactions = transactions.map((t) =>
      t.id === editId ? { ...t, desc, amount, type } : t
    );
    editId = null;
  } else {
    const newTransaction = {
      id: Date.now(),
      desc,
      amount,
      type,
    };
    transactions.push(newTransaction);
  }

  saveAndRender();
  form.reset();
});

//Clear Inputs
clearBtn.addEventListener("click", (e) => {
  e.preventDefault();
  form.reset();
  editId = null;
});

//Delete Transaction
const deleteTransaction = (id) => {
  transactions = transactions.filter((t) => t.id !== id);
  saveAndRender();
  updateTotals();
};

//Edit Transaction
const editTransaction = (id) => {
  const tx = transactions.find((t) => t.id === id);
  if (tx) {
    descriptionInput.value = tx.desc;
    amountInput.value = tx.amount;
    typeSelect.value = tx.type;
    editId = id;
  }
};

//Render Transactions
const renderTransactions = () => {
  taskContainer.innerHTML = "";

  const selectedFilter = document.querySelector(
    "input[name='filter']:checked"
  ).value;

  const filteredTx = transactions.filter((t) =>
    selectedFilter === "all" ? true : t.type === selectedFilter
  );

  if (filteredTx.length === 0) {
    taskContainer.innerHTML =
      "<p style='text-align:center; padding:10px;'>No records found.</p>";
    return;
  }

  filteredTx.forEach((tx) => {
    const div = document.createElement("div");
    div.classList.add("entry");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.background = tx.type === "income" ? "#d4edda" : "#f8d7da";
    div.style.color = "#333";
    div.style.padding = "8px 10px";
    div.style.margin = "5px";
    div.style.borderRadius = "6px";
    div.innerHTML = `
            <span><strong>${tx.desc}</strong> (${tx.type})</span>
            <span>₹${tx.amount.toFixed(2)}</span>
            <div>
                <button class="editBtn"><i class="fa-solid fa-pen-to-square" style="color: #056107;"></i></button>
                <button class="deleteBtn"><i class="fa-solid fa-trash" style="color: #bb1616;"></i></button>
            </div>
        `;

    // Event listeners
    div
      .querySelector(".deleteBtn")
      .addEventListener("click", () => deleteTransaction(tx.id));
    div
      .querySelector(".editBtn")
      .addEventListener("click", () => editTransaction(tx.id));

    taskContainer.appendChild(div);
  });

  updateTotals();
};

//Update Totals
const updateTotals = () => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  totalIncomeEl.textContent = totalIncome.toFixed(2);
  totalExpenseEl.textContent = totalExpenses.toFixed(2);
  netBalanceEl.textContent = netBalance.toFixed(2);
};

//Save to Local Storage
const saveAndRender = () => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
};

//Filter Change Event
filterRadios.forEach((radio) =>
  radio.addEventListener("change", renderTransactions)
);

//Initial Load
renderTransactions();
