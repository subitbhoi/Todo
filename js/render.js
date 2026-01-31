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

        taskText.addEventListener("dblclick", function () {
            startInlineEdit(taskItem, task);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "task-delete";
        deleteButton.setAttribute("aria-label", "Delete task");
        deleteButton.textContent = "✕"

        deleteButton.addEventListener("click", function (e) {
            e.stopPropagation();
            deleteTask(task.id);
            renderTasks();
        });

        taskItem.appendChild(taskToggle);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteButton);

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

function startInlineEdit(taskItem, task) {
    const originalText = task.text;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-edit-input";
    input.value = originalText;

    const textElement = taskItem.querySelector(".task-text");
    taskItem.replaceChild(input, textElement);

    input.focus();
    input.select();

    function save() {
        const newText = input.value.trim();

        if (newText && newText !== originalText) {
            updateTask(task.id, newText);
        }

        renderTasks();
    }

    function cancel() {
        renderTasks();
    }

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            save();
        }

        if (e.key === "Escape") {
            cancel();
        }
    });

    input.addEventListener("blur", function () {
        save();
    });
}
