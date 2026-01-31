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

  tasks = [...tasks, task];
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