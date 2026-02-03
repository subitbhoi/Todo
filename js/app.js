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