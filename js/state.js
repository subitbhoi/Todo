// This file manages the application's data state

const STORAGE_KEY = "todo-app-tasks";

let tasks = loadTasksFromStorage();

/**
 * Creates a new task object and adds it to the tasks array.
 */

function addTask(text) {
  const task = {
    id: Date.now(),
    text,
    completed: false
  };

  tasks = [task, ...tasks];
  saveTasksToStorage();
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

function updateTask(id, newText) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, text: newText }
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