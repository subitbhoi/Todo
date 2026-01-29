// This file is responsible for rendering the UI based on the application state

const taskListElement = document.querySelector(".task-list");

/**
 * Renders the list of tasks to the DOM.
 */

function renderTasks() {
    taskListElement.innerHTML = "";

    const sortedTasks = [...tasks].sort(function (a, b) {
        return a.completed - b.completed;
    });

    sortedTasks.forEach(function (task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        const taskToggle = document.createElement("button");
        taskToggle.className = "task-toggle";
        taskToggle.setAttribute("aria-label", "Toggle Task Completion");

        taskToggle.addEventListener("click", function () {
            toggleTask(task.id);
            renderTasks();
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        taskItem.appendChild(taskToggle);
        taskItem.appendChild(taskText);

        taskListElement.appendChild(taskItem);
    });
}