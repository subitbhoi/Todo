// This file handles user interactions and events

// const taskInput = document.querySelector(".task-input-field");

// taskInput.addEventListener("keydown", function (event) {
//     if (event.key ==="Enter") {
//         const text = (taskInput.value || "").trim();

//         if (text === "") return;

//         addTask(text);
//         renderTasks();

//         taskInput.value = "";
//     }
// });

const dueTrigger = document.getElementById('addDueBtn');
const duePanel = document.getElementById('duePanel');
const clearDueBtn = document.getElementById('clearDueBtn');
const dueDateInput = document.getElementById('dueDate');
const dueTimeInput = document.getElementById('dueTime');

// Toggle panel expanded state
dueTrigger.addEventListener('click', () => {
    const isExpanded = duePanel.classList.toggle('expanded');
    dueTrigger.classList.toggle('active', isExpanded);
    
    // Focus date input when opening for better UX
    if (isExpanded) {
        // Small delay to wait for animation to start
        setTimeout(() => dueDateInput.focus(), 150);
    }
});

// Clear button functionality
clearDueBtn.addEventListener('click', () => {
    // Clear the inputs
    dueDateInput.value = '';
    dueTimeInput.value = '';
    
    // Remove "has due" state from trigger
    dueTrigger.classList.remove('has-due');
    
    // Collapse the panel
    duePanel.classList.remove('expanded');
    dueTrigger.classList.remove('active');
});

// Update trigger state when date is set
dueDateInput.addEventListener('change', () => {
    if (dueDateInput.value) {
        dueTrigger.classList.add('has-due');
    } else {
        dueTrigger.classList.remove('has-due');
    }
});

// Allow keyboard navigation - Escape to close panel
duePanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        duePanel.classList.remove('expanded');
        dueTrigger.classList.remove('active');
        dueTrigger.focus();
    }
});

