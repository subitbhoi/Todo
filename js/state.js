// This file manages the application's data state

let tasks = [];

/**
 * Creates a new task object and adds it to the tasks array.
 */

function addTask(text) {
    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(task);
}

/**
 * Toggle the completed of a task by its ID.
 */

function toggleTask(id) {
    tasks = tasks.map(function (task) {
        if (task.id === id) {
            return {
                ...task, completed: !task.completed
            };
        }

        return task;
    });
}
            