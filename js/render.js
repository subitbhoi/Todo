// This file is responsible for rendering the UI based on the application state

const taskListElement = document.querySelector(".task-list");

/**
 * Renders the list of tasks to the DOM.
 */

function renderTasks() {
    taskListElement.innerHTML = "";

    tasks.forEach(function (task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        const taskToggle = document.createElement("button");
        taskToggle.className = "task-toggle";
        taskToggle.setAttribute("aria-label", "Toggle Task Completion");

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        taskItem.appendChild(taskToggle);
        taskItem.appendChild(taskText);

        taskListElement.appendChild(taskItem);
    });
}