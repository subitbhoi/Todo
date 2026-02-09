/* ===========================================================
   EVENT HANDLER
   
   Handles user interactions and events
============================================================== */

const taskInput = document.querySelector(".task-input-field");

taskInput.addEventListener("keydown", function (event) {
    if (event.key ==="Enter") {
        const text = (taskInput.value || "").trim();

        if (text === "") {
            taskInputWrapper.classList.add("shake");

    setTimeout(() => {
      taskInputWrapper.classList.remove("shake");
    }, 400);

    return;
}

        addTask(text);
        renderTasks();

        taskInput.value = "";
    }
});

/* ===== DUE DATE PANEL INTERACTIONS ===== */

const dueTrigger = document.getElementById('addDueBtn');
const duePanel = document.getElementById('duePanel');
const clearDueBtn = document.getElementById('clearDueBtn');
const dueDateInput = document.getElementById('dueDate');
const dueTimeInput = document.getElementById('dueTime');

/* Toggle panel expanded state */
dueTrigger.addEventListener('click', () => {
    const isExpanded = duePanel.classList.toggle('expanded');
    dueTrigger.classList.toggle('active', isExpanded);
    
    /* Focus date input when opening */
    if (isExpanded) {
        setTimeout(() => dueDateInput.focus(), 150); // Small delay to wait for animation to start
    }
});

/* ────── CLEAR BUTTON ────── */
clearDueBtn.addEventListener('click', () => {
    /* Clear the inputs */
    dueDateInput.value = '';
    dueTimeInput.value = '';
    
    /* Remove "has due" state from trigger */
    dueTrigger.classList.remove('has-due');
    
    /* Collapse the panel */
    duePanel.classList.remove('expanded');
    dueTrigger.classList.remove('active');
});

/* Update trigger state when date is set */
dueDateInput.addEventListener('change', () => {
    if (dueDateInput.value) {
        dueTrigger.classList.add('has-due');
    } else {
        dueTrigger.classList.remove('has-due');
    }
});

/* ────── KEYBOARD FUNCTIONALITY ────── */
duePanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        duePanel.classList.remove('expanded');
        dueTrigger.classList.remove('active');
        dueTrigger.focus();
    }
});
