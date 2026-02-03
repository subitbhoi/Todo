// This file manages the application's data state

const STORAGE_KEY = "todo-app-tasks";

let tasks = loadTasksFromStorage();

/**
 * Creates a new task object and adds it to the tasks array.
 */

function addTask(text) {
    const now = new Date();
  const dateInput = document.getElementById("dueDate");
  const timeInput = document.getElementById("dueTime");

  let dueAt = null;

const hasDate = dateInput && dateInput.value;
const hasTime = timeInput && timeInput.value;

if (hasDate || hasTime) {
  let datePart;
  let timePart;

  // Case 1: Date only → use current time
  if (hasDate && !hasTime) {
    datePart = dateInput.value;

    timePart = now
      .toTimeString()
      .slice(0, 5); // HH:MM
  }

  // Case 2: Time only → use today
  if (!hasDate && hasTime) {
    datePart = now
      .toISOString()
      .slice(0, 10); // YYYY-MM-DD

    timePart = timeInput.value;
  }

  // Case 3: Date + Time
  if (hasDate && hasTime) {
    datePart = dateInput.value;
    timePart = timeInput.value;
  }

  const combined = new Date(`${datePart}T${timePart}`);

  // ❌ Prevent past date/time
  if (combined < now) {
    alert("You cannot set a task in the past.");
    return;
  }

  dueAt = combined.toISOString();
}
  const task = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    dueAt,
    reminded: false
  };

  tasks = [task, ...tasks];
  saveTasksToStorage();
  renderTasks();

  if (dateInput) dateInput.value = "";
  if (timeInput) timeInput.value = "";

  const dueInputsEl = document.querySelector(".due-inputs");
  const addDueBtnEl = document.getElementById("addDueBtn");

  if (dueInputsEl && addDueBtnEl) {
  dueInputs.style.display = "none";
  addDueBtn.style.display = "inline-block";
  }

  // reset inputs
  dateInput.value = "";
  timeInput.value = "";

}

/**
 * Toggle the completed of a task by its ID.
 */

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasksToStorage();
}
     
function loadTasksFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return [];
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed.filter(task =>
            typeof task.id === "number" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Failed to load tasks from storage", error);
        return [];
    }
}

function saveTasksToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }catch (error) {
        console.error("Failed to save tasks to storage", error);
    }
}

// function updateTask(id, newText, newDueAt = undefined) {
//   tasks = tasks.map(task => {
//     if (task.id !== id) return task;

//     return {
//       ...task,
//       text: newText,
//       ...(newDueAt !== undefined && { dueAt: newDueAt })
//     };
//   });

//   saveTasksToStorage();
// }

function updateTask(id, newText, newDueAt = null) {
  tasks = tasks.map(task =>
    task.id === id
    ? {
      ...task,
      text: newText ?? task.text,
      dueAt: newDueAt ?? task.dueAt,
      reminded: newDueAt ? false : task.reminded
    }
    : task
  );

  saveTasksToStorage();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
}

function moveTaskUp(id) {
    const index = tasks.findIndex(task => task.id === id);

    if (index <= 0) return;

    const newTasks = [...tasks];

    [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];

    tasks = newTasks;
    saveTasksToStorage();
}

function moveTaskDown(id) {
    const index = tasks.findIndex(task => task.id ===id);

    if (index === -1 || index >= tasks.length - 1) return;

    const newTasks = [...tasks];

    // [newTasks[index], newTasks[index - 1]] = [newTasks[index + 1], newTasks[index]];
    [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];

    tasks = newTasks;
    saveTasksToStorage();
}

// Reorder logic
function reorderTask(draggedId, targetId) {
    const draggedIndex = tasks.findIndex(t => t.id === draggedId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const updated = [...tasks];
    const [moved] = updated.splice(draggedIndex, 1);

    updated.splice(targetIndex, 0, moved);

    tasks = updated;
    saveTasksToStorage();
}