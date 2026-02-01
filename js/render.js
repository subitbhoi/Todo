// This file is responsible for rendering the UI based on the application state

const taskListElement = document.querySelector(".task-list");

// Drag state
let draggedTaskId = null;
let touchDraggedTaskId = null;
let touchStartY = 0;

/* ===============================
   Render a single task
================================ */
function renderTask(task) {
  const taskItem = document.createElement("div");
  taskItem.className = "task-item";
  taskItem.dataset.id = task.id;
  taskItem.setAttribute("tabindex", "0");

  if (task.completed) {
    taskItem.classList.add("completed");
  }

  /* ===== Drag Handle ===== */
  const dragHandle = document.createElement("button");
  dragHandle.className = "task-drag-handle";
  dragHandle.textContent = "⋮⋮";
  dragHandle.setAttribute("aria-label", "Reorder task");
  dragHandle.setAttribute("draggable", "true");

  // Desktop drag start
  dragHandle.addEventListener("dragstart", function (e) {
    draggedTaskId = task.id;
    taskItem.classList.add("dragging");
    e.dataTransfer.setDragImage(taskItem, 20, 20);
    e.dataTransfer.setData("text/plain", "");
  });

  dragHandle.addEventListener("dragend", function () {
    draggedTaskId = null;
    taskItem.classList.remove("dragging");
  });

  // Mobile touch drag
  dragHandle.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;

    touchDraggedTaskId = task.id;
    touchStartY = e.touches[0].clientY;
    taskItem.classList.add("dragging");
    document.body.style.overflow = "hidden";
  });

  dragHandle.addEventListener("touchmove", function (e) {
    if (!touchDraggedTaskId) return;
    const deltaY = e.touches[0].clientY - touchStartY;
    taskItem.style.transform = `translateY(${deltaY}px)`;
  });

  dragHandle.addEventListener("touchend", function (e) {
    if (!touchDraggedTaskId) return;

    taskItem.classList.remove("dragging");
    taskItem.style.transform = "";
    document.body.style.overflow = "";

    const touchY = e.changedTouches[0].clientY;
    const items = Array.from(document.querySelectorAll(".task-item"));

    const target = items.find(item => {
      const rect = item.getBoundingClientRect();
      return touchY > rect.top && touchY < rect.bottom;
    });

    if (target) {
      const targetId = Number(target.dataset.id);
      if (targetId !== touchDraggedTaskId) {
        reorderTask(touchDraggedTaskId, targetId);
        renderTasks();
      }
    }

    touchDraggedTaskId = null;
  });

  /* ===== Drop target ===== */
  taskItem.addEventListener("dragover", e => e.preventDefault());

  taskItem.addEventListener("drop", function () {
    if (!draggedTaskId || draggedTaskId === task.id) return;
    reorderTask(draggedTaskId, task.id);
    renderTasks();
  });

  /* ===== Toggle completion ===== */
  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.setAttribute("aria-label", "Toggle task completion");

  toggleButton.addEventListener("click", function () {
    toggleTask(task.id);
    renderTasks();
  });

  /* ===== Task text ===== */
  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;

  taskText.addEventListener("dblclick", function () {
    startInlineEdit(taskItem, task);
  });

  /* ===== Delete ===== */
  const deleteButton = document.createElement("button");
  deleteButton.className = "task-delete";
  deleteButton.textContent = "✕";
  deleteButton.setAttribute("aria-label", "Delete task");

  deleteButton.addEventListener("click", function (e) {
    e.stopPropagation();
    deleteTask(task.id);
    renderTasks();
  });

  /* ===== Keyboard support ===== */
  taskItem.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT") {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      taskItem.nextElementSibling?.focus();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      taskItem.previousElementSibling?.focus();
    }

    if (e.key.toLowerCase() == "m") {
      e.preventDefault();
      toggleTask(task.id);
      renderTasks();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      deleteTask(task.id);
      renderTasks();
    }

    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      startInlineEdit(taskItem, task);
    }

    if (e.key.toLowerCase() == "u") {
      e.preventDefault();

      const prev = taskItem.previousElementSibling;
      if (!prev) return;

      const targetId = Number(prev.dataset.id);
      reorderTask(task.id, targetId);
      renderTasks();

      requestAnimationFrame(() => {
        document.querySelector(`.task-item[data-id="${task.id}"]`)?.focus();
      });
    }

    if (e.key.toLowerCase() == "d") {
      e.preventDefault();

      const next = taskItem.nextElementSibling;
      if (!next) return;

      const targetId =  Number(next.dataset.id);
      reorderTask(task.id, targetId);
      renderTasks()

      requestAnimationFrame(() => {
        document.querySelector(`.task-item[data-id="${task.id}"]`)?.focus();
      });
    }
  });

  /* ===== Append order ===== */
  taskItem.appendChild(dragHandle);
  taskItem.appendChild(toggleButton);
  taskItem.appendChild(taskText);
  taskItem.appendChild(deleteButton);

  taskListElement.appendChild(taskItem);
}

/* ===============================
   Render all tasks (FLIP)
================================ */
function renderTasks() {
  const previousPositions = new Map();

  document.querySelectorAll(".task-item").forEach(item => {
    previousPositions.set(item.dataset.id, item.getBoundingClientRect());
  });

  taskListElement.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet";
    taskListElement.appendChild(empty);
    return;
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  activeTasks.forEach(renderTask);
  completedTasks.forEach(renderTask);

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

/* ===============================
   Inline Editing
================================ */
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
