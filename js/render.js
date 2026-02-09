/* ===========================================================
   UI RENDER
   
   Handles UI rendering based on application state
============================================================== */

const taskListElement = document.querySelector(".task-list");

/* ────── DRAG STATES ────── */
let draggedTaskId = null;
let touchDraggedTaskId = null;
let touchStartY = 0;

let completedCollapsed = JSON.parse(localStorage.getItem("completedCollapsed")) ?? false;
let archivedCollapsed = JSON.parse(localStorage.getItem("archivedCollapsed")) ?? false;

let suppressFlip = false;

/* ===== UNCOMPLETED TASKS HEADER ===== */

const crossIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
crossIcon.setAttribute("viewBox", "0 0 24 24");
crossIcon.setAttribute("width", "16");
crossIcon.setAttribute("height", "16");
crossIcon.setAttribute("fill", "none");
crossIcon.classList.add("uncompleted-icon");

crossIcon.innerHTML = `
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
  <path d="M9 9l6 6M15 9l-6 6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
`;

const activeHeader = document.createElement("div");
activeHeader.className = "active-tasks-header";
activeHeader.style.display = "none";

const activeLabel = document.createElement("span");
activeLabel.textContent = "Tasks";

const activeCount = document.createElement("span");
activeCount.className = "active-count";

/* ────── APPEND ORDER ────── */
activeHeader.appendChild(crossIcon);
activeHeader.appendChild(activeLabel);
activeHeader.appendChild(activeCount);

taskListElement.parentNode.insertBefore(activeHeader, taskListElement);

/* ===== RENDER A SINGLE TASK ===== */

function renderTask(task) {
  const mainRow = document.createElement("div");
  mainRow.className = "task-main-row";

  const metaRow = document.createElement("div");
  metaRow.className = "task-meta-row task-meta-editable";

  const leftControls = document.createElement("div");
  leftControls.className = "task-left-controls";

  const rightActions = document.createElement("div");
  rightActions.className = "task-actions";

  const taskItem = document.createElement("div");
  taskItem.className = "task-item";
  taskItem.dataset.id = task.id;
  taskItem.setAttribute("tabindex", "0");

  if (task.completed) {
    taskItem.classList.add("completed");
  }

  if (task.dueAt && !task.completed) {
    const now = new Date();
    const dueDate = new Date(task.dueAt);
    const diffMs = dueDate - now;

    taskItem.classList.remove("due-soon", "overdue");

    if (diffMs <= 0) {
      taskItem.classList.add("overdue");
    }
    else if (diffMs <= 15 * 60 * 1000) {
      taskItem.classList.add("due-soon"); // ONLY pulse in last 15 minutes
    }
  }

  /* ────── DRAG HANDLE ────── */
  const dragHandle = document.createElement("button");
  dragHandle.className = "task-drag-handle";
  dragHandle.textContent = "⋮⋮";
  dragHandle.setAttribute("aria-label", "Reorder task");
  dragHandle.setAttribute("draggable", "true");

  /* Desktop Drag Start */
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

  /* Mobile Touch Drag */
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

  /* ────── DROP TARGET ────── */
  taskItem.addEventListener("dragover", e => e.preventDefault());

  taskItem.addEventListener("drop", function () {
    if (!draggedTaskId || draggedTaskId === task.id) return;
    reorderTask(draggedTaskId, task.id);
    renderTasks();
  });

  /* ────── TOGGLE COMPLETION ────── */
  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.setAttribute("aria-label", "Toggle task completion");

  toggleButton.addEventListener("click", () => {
    toggleTask(task.id);
    renderTasks();
  });

  /* ────── TASK TEXT ────── */
  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;

  /* ────── DELETE BUTTON ────── */
  const deleteButton = document.createElement("button");
  deleteButton.className = "task-delete";
  deleteButton.textContent = "✖";
  deleteButton.setAttribute("aria-label", "Delete task");

  deleteButton.addEventListener("click", function (e) {
    e.stopPropagation();
    deleteTask(task.id);
    renderTasks();
  });

  /* ────── ARCHIVE BUTTON ────── */
  const archiveButton = document.createElement("button");
  archiveButton.className = "task-archive";
  archiveButton.classList.add("task-archive");
  archiveButton.textContent = "↪";
  archiveButton.setAttribute("aria-label", "Archive task");

  archiveButton.addEventListener("click", e => {
    e.stopPropagation();
    archiveTask(task.id);
    renderTasks();
  });

  if (task.archived) {
    taskItem.classList.add("archived");
  }

  /* ────── KEYBOARD FUNCTIONALITY FOR TASKS LIST ────── */
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

  /* ────── APPEND ORDER ────── */
  leftControls.appendChild(dragHandle);
  leftControls.appendChild(toggleButton);

  rightActions.appendChild(archiveButton);
  rightActions.appendChild(deleteButton);

  mainRow.appendChild(leftControls);
  mainRow.appendChild(taskText);
  mainRow.appendChild(rightActions);

  mainRow.addEventListener("dblclick", e => {
    if (task.completed) return;
    if (e.target.closest("button")) return; // ignore buttons (toggle, delete, drag)

    startInlineEdit(taskItem, task);
  });

  taskItem.appendChild(mainRow);

  /* ────── DUE DATE & TIME ────── */
  if (task.dueAt) {
    const date = new Date(task.dueAt);

    const calendarIcon = createCalendarIcon();
    calendarIcon.classList.add("meta-clickable");

    const dateText = document.createElement("span");
    dateText.className = "task-date-text meta-clickable";
    dateText.textContent = date.toLocaleDateString(undefined, {
      dateStyle: "medium"
    });

    const timeGroup = document.createElement("span");
    timeGroup.className = "meta-group";

    const clockIcon = createClockIcon();
    clockIcon.classList.add("meta-clickable");

    const timeText = document.createElement("span");
    timeText.className = "task-time-text meta-clickable";
    timeText.textContent = date.toLocaleTimeString(undefined, {
      timeStyle: "short"
    });

    timeGroup.appendChild(clockIcon);
    timeGroup.appendChild(timeText);


    if (task.dueAt && !task.completed) {
      const now = new Date();
      const diffMs = new Date(task.dueAt) - now;

      const DAY = 24 * 60 * 60 * 1000;
      const HOUR = 60 * 60 * 1000;
      const MIN30 = 30 * 60 * 1000;
      const MIN15 = 15 * 60 * 1000;

      let badgeType = null;
      let badgeText = null;

      if (diffMs <= 0) {
        badgeType = "overdue";
        badgeText = "Overdue";
      } else if (diffMs < MIN30) {
        badgeType = "due-soon";
        badgeText = formatRemainingTime(diffMs);
      } else if (diffMs < HOUR) {
        badgeType = "due-warning";
        badgeText = formatRemainingTime(diffMs);
      } else if (diffMs <= 7 * DAY) {
        badgeType = "due-far";
        badgeText = formatRemainingTime(diffMs);
      }

      if (badgeType) {
        addDueBadge(timeGroup, badgeText, badgeType); // Add badge only if <= 7 days
      }

      if (diffMs < MIN15 && diffMs > 0) {
        taskItem.classList.add("due-pulse"); // Pulse only if due < 15 mins
      } else {
        taskItem.classList.remove("due-pulse");
      }
    }

    /* ────── APPEND ORDER ────── */
    metaRow.appendChild(calendarIcon);
    metaRow.appendChild(dateText);
    metaRow.appendChild(timeGroup);

    taskItem.appendChild(metaRow);

    /* ────── INLINE DUE EDIT ────── */
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

  return taskItem;
}

/* ===== COMPLETED/ARCHIVED HEADER ===== */

 /* ────── COMPLETED HEADER ────── */
function createCompletedHeader() {
  const header = document.createElement("div");
  header.className = "completed-header";
  header.tabIndex = 0;

  /* ────── CHECKMARK ICON ────── */
  const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  checkIcon.setAttribute("viewBox", "0 0 24 24");
  checkIcon.setAttribute("width", "16");
  checkIcon.setAttribute("height", "16");
  checkIcon.setAttribute("fill", "none");
  checkIcon.classList.add("completed-icon");
  checkIcon.innerHTML = `
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
    <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  /* ────── CHEVRON ARROW ICON ────── */
  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("width", "14");
  chevron.setAttribute("height", "14");
  chevron.setAttribute("fill", "none");
  chevron.classList.add("completed-chevron");
  chevron.id = "completedArrow";
  if (!completedCollapsed) {
    chevron.classList.add("expanded");
  }
  chevron.innerHTML = `
    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  const label = document.createElement("span");
  label.textContent = "Completed";

  const completedCountEl = document.createElement("span");
  completedCountEl.className = "completed-count";
  completedCountEl.textContent = "";

  /* ────── APPEND ORDER ────── */
  header.appendChild(checkIcon);
  header.appendChild(chevron);
  header.appendChild(label);
  header.appendChild(completedCountEl);

  header.addEventListener("click", toggleCompleted);
  header.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCompleted();
    }
  });

  return header;
}

 /* ────── ARCHIVED HEADER ────── */
 function createArchivedHeader() {
 const header = document.createElement("div");
 header.className = "archived-header";
 header.tabIndex = 0;

 const archiveIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  archiveIcon.setAttribute("viewBox", "0 0 24 24");
  archiveIcon.setAttribute("width", "16");
  archiveIcon.setAttribute("height", "16");
  archiveIcon.classList.add("archived-icon");
  archiveIcon.innerHTML = `
    <path d="M3 7h18" stroke="currentColor" stroke-width="1.5"/>
    <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 11h6" stroke="currentColor" stroke-width="1.5"/>
  `;
  
  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("width", "14");
  chevron.setAttribute("height", "14");
  chevron.setAttribute("fill", "none");
  chevron.classList.add("archived-chevron");
  chevron.id = "archivedArrow";
  if (!completedCollapsed) {
    chevron.classList.add("expanded");
  }
  chevron.innerHTML = `
    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  const label = document.createElement("span");
  label.textContent = "Archived";

  const archivedCountEl = document.createElement("span");
  archivedCountEl.className = "archived-count";
  archivedCountEl.textContent = "";

  /* ────── APPEND ORDER ────── */
  header.appendChild(archiveIcon);
  header.appendChild(chevron);
  header.appendChild(label);
  header.appendChild(archivedCountEl);

  header.addEventListener("click", toggleArchived);
  header.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleArchived();
    }
  });

  return header;
}

/* ────── COMPLETED TASK SECTION ────── */
function toggleCompleted() {
  suppressFlip = true;

  completedCollapsed = !completedCollapsed;
  localStorage.setItem("completedCollapsed", JSON.stringify(completedCollapsed));

  /* Update chevron rotation */
  const chevron = document.getElementById("completedArrow");
  if (chevron) {
    chevron.classList.toggle("expanded", !completedCollapsed);
  }

  /* Toggle visibility of completed task items */
  document.querySelectorAll(".task-item.completed").forEach(item => {
    if (completedCollapsed) {
      item.classList.add("completed-hidden");
    } else {
      item.classList.remove("completed-hidden");
    }
  });

  requestAnimationFrame(() => {
    suppressFlip = false;
  });
}

function toggleArchived() {
  suppressFlip = true;

  archivedCollapsed = !archivedCollapsed;
  localStorage.setItem("archivedCollapsed", JSON.stringify(archivedCollapsed));

  const chevron = document.getElementById("archivedArrow");
  if (chevron) {
    chevron.classList.toggle("expanded", !archivedCollapsed);
  }

  document.querySelectorAll(".task-item.archived").forEach(item => {
    if (archivedCollapsed) {
      item.classList.add("archived-hidden");
    } else {
      item.classList.remove("archived-hidden");
    }
  });

  requestAnimationFrame(() => {
    suppressFlip = false;
  })
}

/* ===== RENDER ALL TASKS (FLIP) ====== */

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

  const fragment = document.createDocumentFragment();

  const activeTasks = tasks.filter(t => !t.completed && !t.archived);
  const completedTasks = tasks.filter(t => t.completed && !t.archived);
  const archivedTasks = tasks.filter(t => t.archived);

  /* Render active tasks */
  activeTasks.forEach(task => fragment.appendChild(renderTask(task)));

  /* Render completed section if there are completed tasks */
  if (completedTasks.length > 0) {
    fragment.appendChild(createCompletedHeader());

    completedTasks.forEach(task => {
      const item = renderTask(task);
      if (completedCollapsed) {
        item.classList.add("completed-hidden");
      }
      fragment.appendChild(item);
    });
  }

  if (archivedTasks.length > 0) {
    fragment.appendChild(createArchivedHeader());

    archivedTasks.forEach(task => {
      const item = renderTask(task);
      if (archivedCollapsed) {
        item.classList.add("archived-hidden");
      }
      const archiveBtn = item.querySelector(".task-archive");
      if (archiveBtn) {
        archiveBtn.classList.add("task-restore");
        archiveBtn.textContent = "↻";
        archiveBtn.setAttribute("aria-label", "Restore-task");
        archiveBtn.onclick = e => {
          e.stopPropagation();
          restoreTask(task.id);
          renderTasks();
        };
      }
      fragment.appendChild(item);
    });
  }

  taskListElement.appendChild(fragment);

  updateCompletedCount();
  updateArchivedCount();

  /* ────── FLIP ANIMATION ────── */
  if (!suppressFlip) {
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
          item.style.transition = "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)";
        });
      }
    });
  }

  updateActiveHeader();
}

/* After FLIP calculation, apply the proper collapsed/expanded state */
const panel = document.getElementById("completedPanel");
if (panel) {
  requestAnimationFrame(() => {
    panel.style.transition = "";
    if (completedCollapsed) {
      panel.classList.remove("expanded");
    }
  });
}

/* Sync chevron state */
const chevron = document.querySelector(".completed-chevron");
if (chevron) {
  chevron.classList.toggle("expanded", !completedCollapsed);
}

/* ────── ACTIVE TASKS COUNT ────── */
function updateActiveHeader() {
  const count = tasks.filter(t => !t.completed).length;

  if (count === 0) {
    activeHeader.style.display = "none";
    return;
  }

  activeHeader.style.display = "flex";
  activeCount.textContent = `(${count})`;
}

/* ────── COMPLETED TASKS COUNT ────── */
function updateCompletedCount() {
  const completedCountEl = document.querySelector(".completed-count");
  if (!completedCountEl) return;

  const completedCount = tasks.filter(t => t.completed).length;

  completedCountEl.textContent = completedCount > 0 ? `(${completedCount})` : "";
}

/* ────── ARCHIVED TASKS COUNT ────── */
function updateArchivedCount() {
  const archivedCountEl = document.querySelector(".archived-count");
  if (!archivedCountEl) return;

  const archivedCount = tasks.filter(t => t.archived).length;

  archivedCountEl.textContent = archivedCount > 0 ? `(${archivedCount})` : "";
}

function addDueBadge(container, text, type) {

  /* prevent duplicates */
  if (container.querySelector(".due-badge")) return;

  const badge = document.createElement("span");
  badge.className = `due-badge ${type}`;
  badge.textContent = text;

  container.appendChild(badge);
}

/* ===== INLINE EDIT =====*/

/* ────── TASKS INLINE EDIT ────── */
function startInlineEdit(taskItem, task) {
  const originalText = task.text;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-edit-input";
  input.value = originalText;

  /* Find the text element and its parent (mainRow) */
  const textEl = taskItem.querySelector(".task-text");
  const mainRow = taskItem.querySelector(".task-main-row");

  mainRow.replaceChild(input, textEl); // Replace within the correct parent

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

/* ────── DUE INLINE EDIT ────── */
function startInlineDueEdit(taskItem, task, focusField) {
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

  /* Date and Time input focus logic */
  requestAnimationFrame(() => {
    if (focusField === "time") {
      timeInput.focus();
    } else {
      dateInput.focus();
    }
  });

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

  /* Use focusout on metaRow to detect when focus leaves both date & time inputs */
  metaRow.addEventListener("focusout", function (e) {

    if (metaRow.contains(e.relatedTarget)) return; // If focus is moving to the other input inside metaRow, don't save yet
    save();
  });
}

/* ===== CALENDAR & CLOCK ICON ===== */

/* ────── CALENDAR ICON ────── */
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

/* ────── CLOCK ICON ────── */
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

/* ===== DUE TIME LOGIC ===== */

function formatRemainingTime(ms) {
  if (ms <= 0) return "Overdue";

  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays >= 1) {
    return `${totalDays}d left`;
  }

  if (totalHours >= 1) {
    return `${totalHours}h left`;
  }

  if (totalMinutes >= 1) {
    return `${totalMinutes}m left`;
  }

  return `${totalSeconds}s left`;
}

/* ────── COUNTDOWN BADGE ────── */
function updateCountdownBadges() {
  document.querySelectorAll(".task-item").forEach(item => {
    const id = Number(item.dataset.id);
    const task = tasks.find(t => t.id === id);
    if (!task || !task.dueAt || task.completed) return;

    const badge = item.querySelector(".due-badge");
    if (!badge) return;

    const diff = new Date(task.dueAt) - new Date();
    const newText = diff <= 0 ? "Overdue" : formatRemainingTime(diff);

    if (badge.textContent !== newText) {
      badge.style.opacity = "0";
      setTimeout(() => {
        badge.textContent = newText;
        badge.style.opacity = "1";
      }, 120);
    }
  });
}

setInterval(updateCountdownBadges, 1000);