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