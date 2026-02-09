/* ===============================================================
   APP INITIALIZATION
   
   Defines application initialization and connects all components
================================================================== */

// console.log("Todo App Initialized");

document.addEventListener("DOMContentLoaded", function () {
  renderTasks();
});

/* ────── DUE BUTTON ────── */
const addDueBtn = document.getElementById("addDueBtn");
const dueInputs = document.querySelector(".due-inputs");

addDueBtn.addEventListener("click", () => {
  dueInputs.style.display = "flex";
  addDueBtn.style.display = "none";
});

startReminderEngine();

setInterval(() => {
  renderTasks();
}, 6000_000);

/* ────── TASK BUTTON ────── */
const inputEl = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskBtn");
const taskInputWrapper = document.querySelector(".task-input-wrapper");

addBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (!text) {
    taskInputWrapper.classList.add("shake");

    setTimeout(() => {
      taskInputWrapper.classList.remove("shake");
    }, 400);

    return;
  }

  addTask(text);   
  renderTasks();  

  inputEl.value = "";
  inputEl.focus();
});
