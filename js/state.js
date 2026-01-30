// This file manages the application's data state

const STORAGE_KEY = "todo-app"

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

    tasks = [...tasks, task];
    saveTasksToStorage(tasks);
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

  saveTasksToStorage(tasks);
}
            
/**
 * Task edit
 */

function updatetask(id, newText) {
    tasks = tasks.map(task =>
        task.id === id
        ? { ...task, text: newText }
           : task
    );
        saveTasksToStorage(tasks);
}

function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Validate: must be an array
    if (!Array.isArray(parsed)) return [];

    // Validate each task shape
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

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasksToStorage(tasks);
}


function saveTasksToStorage(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks to storage", error);
  }
}
