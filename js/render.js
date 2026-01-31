// This file is responsible for rendering the UI based on the application state

const taskListElement = document.querySelector(".task-list");

let draggedTaskId = null;

/* ===== Render a single task item ===== */
function renderTask(task) {
  const taskItem = document.createElement("div");
  taskItem.className = "task-item";
  taskItem.dataset.id = task.id;

  if (task.completed) {
    taskItem.classList.add("completed");
  }

  // Drag feature
  taskItem.setAttribute("draggable", "true");
  
  taskItem.addEventListener("dragstart", function () {
    draggedTaskId = task.id;
    taskItem.classList.add("dragging");
  });

  taskItem.addEventListener("dragged", function () {
    taskItem.classList.remove("dragging");
    draggedTaskId =null;
  });

  taskItem.addEventListener("dragover", function (e) {
    e.preventDefault();
  });

  taskItem.addEventListener("drop", function () {
    if (draggedTaskId === null || draggedTaskId === task.id) return;

    reorderTask(draggedTaskId, task.id);
    renderTasks();
  });

  //   Move up button
  const upButton = document.createElement("button");
  upButton.className = "task-move-up";
  upButton.textContent = "↑";
  upButton.setAttribute("aria-label", "Move task up");

  upButton.addEventListener("click", function (e) {
    e.stopPropagation();
    moveTaskUp(task.id);
    renderTasks();
  });

  //   Move down button
  const downButton = document.createElement("button");
  downButton.className = "task-move-down";
  downButton.textContent = "↓";
  downButton.setAttribute("aria-label", "Move task down");

  downButton.addEventListener("click", function (e) {
    e.stopPropagation();
    moveTaskDown(task.id);
    renderTasks();
  });

  //  Toggle completion
  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.setAttribute("aria-label", "Toggle task completion");

  toggleButton.addEventListener("click", function () {
    toggleTask(task.id);
    renderTasks();
  });

  // Task text
  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;

  taskText.addEventListener("dblclick", function () {
    startInlineEdit(taskItem, task);
  });

  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "task-delete";
  deleteButton.textContent = "✕";
  deleteButton.setAttribute("aria-label", "Delete task");

  deleteButton.addEventListener("click", function (e) {
    e.stopPropagation();
    deleteTask(task.id);
    renderTasks();
  });

  // Append
  taskItem.appendChild(upButton);
  taskItem.appendChild(downButton);
  taskItem.appendChild(toggleButton);
  taskItem.appendChild(taskText);
  taskItem.appendChild(deleteButton);

  taskListElement.appendChild(taskItem);
}

/**
 * Render all tasks with FLIP animation
 */
function renderTasks() {
  const previousPositions = new Map();

  // Measure old positions
  document.querySelectorAll(".task-item").forEach(item => {
    previousPositions.set(item.dataset.id, item.getBoundingClientRect());
  });

  taskListElement.innerHTML = "";

  // Empty state
  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet";
    taskListElement.appendChild(empty);
    return;
  }

  // Split tasks (NO SORTING)
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // Render in two passes
  activeTasks.forEach(renderTask);
  completedTasks.forEach(renderTask);

  // Animate position changes (FLIP)
  document.querySelectorAll(".task-item").forEach(item => {
    const oldPos = previousPositions.get(item.dataset.id);
    if (!oldPos) return;

    const newPos = item.getBoundingClientRect();
    const deltaY = oldPos.top - newPos.top;

    if (deltaY) {
      item.style.transform = `translateY(${deltaY}px)`;
      item.style.transition = "none";

      requestAnimationFrame(() => {
        item.style.transform = "";
        item.style.transition = "";
      });
    }
  });
}

/**
 * Inline editing (state-first, safe)
 */
function startInlineEdit(taskItem, task) {
  const originalText = task.text;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-edit-input";
  input.value = originalText;

  const textEl = taskItem.querySelector(".task-text");
  taskItem.replaceChild(input, textEl);

  input.focus();
  input.select();

  function save() {
    const value = input.value.trim();
    if (value && value !== originalText) {
      updateTask(task.id, value);
    }
    renderTasks();
  }

  function cancel() {
    renderTasks();
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  });

  input.addEventListener("blur", save, { once: true });
}
