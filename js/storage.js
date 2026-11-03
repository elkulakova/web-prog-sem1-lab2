const STORAGE_KEY = 'todo-list-tasks';

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch (error) {
    return null;
  }
}

function saveTodos(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
