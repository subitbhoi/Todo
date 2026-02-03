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
  const mainRow = document.createElement("div");
  mainRow.className = "task-main-row";

  const metaRow = document.createElement("div");
  metaRow.className = "task-meta-row task-meta-editable";

  const leftControls = document.createElement("div");
  leftControls.className = "task-left-controls";

  const taskItem = document.createElement("div");
  taskItem.className = "task-item";
  taskItem.dataset.id = task.id;
  taskItem.setAttribute("tabindex", "0");

  if (task.completed) {
    taskItem.classList.add("completed");
  }

  if (task.dueAt && !task.completed) {
  const now = new Date();
  const due = new Date(task.dueAt);
  const diffMs = due - now;
  const diffMinutes = diffMs / 60000;

  // Remove old states
  taskItem.classList.remove("due-soon", "overdue");

  if (!task.completed && task.dueAt) {
    const dueDate =  new Date(task.dueAt);
    const diffMs = dueDate - new Date();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMs <= 0) {
      taskItem.classList.add("overdue");
      addDueBadge(taskItem, "overdue", "overdue");
    }
    else if (diffMinutes <= 30) {
      if (!task.reminded) {
        taskItem.classList.add("due-soon");
      } else {
        taskItem.classList.add("overdue");
      }

      addDueBadge(taskItem, "due soon", "soon");
    }
  }
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

    if (e.key === "Delete") {
      e.preventDefault();
      deleteTask(task.id);
      renderTasks();
    }

    if (e.key.toLowerCase() === "e") {
      if (task.completed) return;
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

      const targetId = Number(next.dataset.id);
      reorderTask(task.id, targetId);
      renderTasks()

      requestAnimationFrame(() => {
        document.querySelector(`.task-item[data-id="${task.id}"]`)?.focus();
      });
    }
  });

  /* ===== Append order ===== */
  leftControls.appendChild(dragHandle);
  leftControls.appendChild(toggleButton);

  mainRow.appendChild(leftControls);
  mainRow.appendChild(taskText);
  mainRow.appendChild(deleteButton);

  mainRow.addEventListener("dblclick", e => {
    if (task.completed) return;
    // ignore buttons (toggle, delete, drag)
    if (e.target.closest("button")) return;

    startInlineEdit(taskItem, task);
  });


  taskItem.appendChild(mainRow);

  /*=====Due date =====*/
  if (task.dueAt) {
    const date = new Date(task.dueAt);

    const calendarIcon = createCalendarIcon();
    calendarIcon.classList.add("meta-clickable");

    const dateText = document.createElement("span");
    dateText.className = "task-date-text meta-clickable";
    dateText.textContent = date.toLocaleDateString(undefined, {
      dateStyle: "medium"
    });

    const clockIcon = createClockIcon();
    clockIcon.classList.add("meta-clickable");

    const timeText = document.createElement("span");
    timeText.className = "task-time-text meta-clickable";
    timeText.textContent = date.toLocaleTimeString(undefined, {
      timeStyle: "short"
    });

    metaRow.appendChild(calendarIcon);
    metaRow.appendChild(dateText);
    metaRow.appendChild(clockIcon);
    metaRow.appendChild(timeText);

    taskItem.appendChild(metaRow);

    calendarIcon.addEventListener("dblclick", e => {
      e.stopPropagation();
      if (task.completed) return;
      startInlineDueEdit(taskItem, task, "date");
    });

    dateText.addEventListener("dblclick", e => {
      e.stopPropagation();
      if (task.completed) return;
      startInlineDueEdit(taskItem, task, "date");
    });

    clockIcon.addEventListener("dblclick", e => {
      e.stopPropagation();
      if (task.completed) return;
      startInlineDueEdit(taskItem, task, "time");
    });

    timeText.addEventListener("dblclick", e => {
      e.stopPropagation();
      if (task.completed) return;
      startInlineDueEdit(taskItem, task, "time");
    });
  }

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

function addDueBadge(taskItem, text, type) {
  // prevent duplicates
  if (taskItem.querySelector(".due-badge")) return;

  const badge = document.createElement("span");
  badge.className = `due-badge ${type}`;
  badge.textContent = text;

  taskItem.appendChild(badge);
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

  // Find the text element and its parent (mainRow)
  const textEl = taskItem.querySelector(".task-text");
  const mainRow = taskItem.querySelector(".task-main-row");

  // Replace within the correct parent
  mainRow.replaceChild(input, textEl);

  input.focus();
  input.select();

  let saved = false;

  function save() {
    if (saved) return;
    saved = true;

    const value = input.value.trim();
    if (value && value !== originalText) {
      updateTask(task.id, value);
    }
    renderTasks();
  }

  function cancel() {
    if (saved) return;
    saved = true;
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

/*===== Due inline edit =====*/
function startInlineDueEdit(taskItem, task) {
  const originalDueAt = task.dueAt;
  const originalDate = new Date(originalDueAt);

  const metaRow = taskItem.querySelector(".task-meta-row");
  metaRow.innerHTML = "";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = originalDate.toISOString().slice(0, 10);

  const timeInput = document.createElement("input");
  timeInput.type = "time";
  timeInput.value = originalDate.toTimeString().slice(0, 5);

  metaRow.appendChild(dateInput);
  metaRow.appendChild(timeInput);

  dateInput.focus();

  let saved = false;

  function save() {
    if (saved) return;
    saved = true;

    const now = new Date();
    const hasDate = dateInput.value;
    const hasTime = timeInput.value;

    if (!hasDate && !hasTime) {
      renderTasks();
      return;
    }

    const datePart = hasDate
      ? dateInput.value
      : now.toISOString().slice(0, 10);

    const timePart = hasTime
      ? timeInput.value
      : now.toTimeString().slice(0, 5);

    const combined = new Date(`${datePart}T${timePart}`);

    if (combined < now) {
      alert("You cannot set a task in the past.");
      renderTasks();
      return;
    }

    updateTask(task.id, task.text, combined.toISOString());
    renderTasks();
  }

  function cancel() {
    if (saved) return;
    saved = true;
    renderTasks();
  }

  metaRow.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  });

  // Use focusout on metaRow to detect when focus leaves BOTH inputs
  metaRow.addEventListener("focusout", function (e) {
    // If focus is moving to the other input inside metaRow, don't save yet
    if (metaRow.contains(e.relatedTarget)) return;
    save();
  });
}

/* ===============================
   Callender and Clock Icon
================================ */
function createCalendarIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.classList.add("calendar-icon");

  svg.innerHTML = `
    <rect x="3" y="4" width="18" height="18" rx="2"
      stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="3" y1="9" x2="21" y2="9"
      stroke="currentColor" stroke-width="1.5"/>
    <line x1="8" y1="2.5" x2="8" y2="6"
      stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="2.5" x2="16" y2="6"
      stroke="currentColor" stroke-width="1.5"/>
  `;

  return svg;
}

function createClockIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.classList.add("clock-icon");

  svg.innerHTML = `
    <circle cx="12" cy="12" r="9"
      stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M12 7v5l3 2"
      stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round"/>
  `;

  return svg;
}

