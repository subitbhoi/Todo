// This file handles user interactions and events

const taskInput = document.querySelector(".task-input-field");

taskInput.addEventListener("keydown", function (event) {
    if (event.key ==="Enter") {
        const text = (taskInput.value || "").trim();

        if (text === "") return;

        addTask(text);
        renderTasks();

        taskInput.value = "";
    }
});
