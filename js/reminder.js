/* ===========================================================
   REMINDERS
   
   Handles reminders and notifications
============================================================== */

/* ────── INBUILT REMINDER FUNCTION ────── */
function startReminderEngine() {
  setInterval(() => {
    const now = new Date();

    let changed = false;

    tasks.forEach(task => {
      if (
        task.dueAt &&
        !task.completed &&
        !task.reminded &&
        !task.archived &&
        new Date(task.dueAt) <= now
      ) {
        alert(`${task.text} is due for completion`);

        task.reminded = true;
        changed = true;
      }
    });

    if (changed) {
      saveTasksToStorage();
      renderTasks();
    }
  }, 5_000); 
}

