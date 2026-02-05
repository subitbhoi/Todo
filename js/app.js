// This file initializes the application and connects all components

console.log("Todo App Initialized");

document.addEventListener("DOMContentLoaded", function () {
  renderTasks();
});

const addDueBtn = document.getElementById("addDueBtn");
const dueInputs = document.querySelector(".due-inputs");

addDueBtn.addEventListener("click", () => {
  dueInputs.style.display = "flex";
  addDueBtn.style.display = "none";
});

startReminderEngine();

setInterval(() => {
  renderTasks();
}, 60_000);

const inputEl = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskBtn");
const taskInputWrapper = document.querySelector(".task-input-wrapper")

addBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (!text) {
    taskInputWrapper.classList.add("shake");

    setTimeout(function () {
      taskInputWrapper.classList.remove("shake");
    }, 400);
    return;
  }

  addTask(text);   
  renderTasks();   // ← re-render UI

  inputEl.value = "";
  inputEl.focus();
});

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});
