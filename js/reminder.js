// This file is responsible for reminders

function startReminderEngine() {
  setInterval(() => {
    const now = new Date();

    let changed = false;

    tasks.forEach(task => {
      if (
        task.dueAt &&
        !task.completed &&
        !task.reminded &&
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
  }, 5_000); // every 30 seconds
}

