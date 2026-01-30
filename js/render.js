// This file is responsible for rendering the UI based on the application state

const taskListElement = document.querySelector(".task-list");

/**
 * Renders the list of tasks to the DOM.
 */

let currentlyEditingTaskId = null;

function commitEditingIfAny() {
    if (currentlyEditingTaskId === null) return;

    const editingElement = document.querySelector(
        `.task-item[data-id="${currentlyEditingTaskId}"] .task-text`
    );

    if (!editingElement) {
        currentlyEditingTaskId = null;
        return;
    }

    const newText = editingElement.textContent.trim();
    if (newText !== "") {
        updateTask(currentlyEditingTaskId, newText);
    }

    currentlyEditingTaskId = null;
}

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

        taskToggle.addEventListener("pointerdown", function () {
            commitEditingIfAny(); 
        });

        taskToggle.addEventListener("click", function () {
            toggleTask(task.id);
            renderTasks();
        });
        
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;
        taskText.setAttribute("tabindex", "0");

        taskText.addEventListener("dblclick", function () {
            startEditing(taskText, task.id);
        });

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

function startEditing(element, taskId) {
    currentlyEditingTaskId = taskId;

    const taskFromState = tasks.find(t => t.id === taskId)
    const originalText = taskFromState.text;

    element.contentEditable = "true";
    element.focus();

    //Move cursor to end
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);

    function save() {
        element.contentEditable = "false";
        const newText = element.textContent.trim();
        if (newText !== "") {
            updateTask(taskId, newText);
        }
        currentlyEditingTaskId = null;
        renderTasks();
    }

    function cancel() {
        element.contentEditable = "false";
        element.textContent = originalText;
        currentlyEditingTaskId = null;
        renderTasks();
    }

    element.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            cancel();
        }
    });

    element.addEventListener("blur", save, { once: true });
}