// This file is responsible for rendering the UI based on the application state

const taskListElement = document.querySelector(".task-list");

/**
 * Renders the list of tasks to the DOM.
 */

function renderTasks() {
    const previousPositions = new Map();

    //Measure current positions
    document.querySelectorAll(".task-item").forEach(function (item) {
        const id = item.dataset.id;
        previousPositions.set(id, item.getBoundingClientRect());
    });

    taskListElement.innerHTML = "";

    const sortedTasks = [...tasks].sort(function (a, b) {
        return a.completed - b.completed;
    });

    sortedTasks.forEach(function (task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.dataset.id = task.id;

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

        // Animate from old position to new position
        document.querySelectorAll(".task-item").forEach(function (item) {
            const id = item.dataset.id;
            const oldPosition = previousPositions.get(id);

            if (!oldPosition) return;

            const newPosition = item.getBoundingClientRect();
            const deltaY = oldPosition.top - newPosition.top;

            if (deltaY) {
                item.style.transform = `translateY(${deltaY}px)`;
                item.style.transition = "none";

                requestAnimationFrame(function () {
                    item.style.transform = "";
                    item.style.transition = "";
                });
            }
    });
}