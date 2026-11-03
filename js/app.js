const savedTodos = loadTodos();
let todos = savedTodos ? savedTodos : INITIAL_TASKS.slice();
let editingId = null;
let pendingDeleteId = null;
let currentFilter = 'all';
let currentSort = 'date-desc';
let searchQuery = '';

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getUiState() {
  return { editingId, pendingDeleteId };
}

function getVisibleTodos() {
  let list = todos.slice();

  if (currentFilter === 'active') {
    list = list.filter((task) => !task.completed);
  } else if (currentFilter === 'completed') {
    list = list.filter((task) => task.completed);
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    list = list.filter((task) => task.title.toLowerCase().includes(query));
  }

  list.sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';

    if (dateA === dateB) {
      return a.order - b.order;
    }
    if (!dateA) return 1;
    if (!dateB) return -1;

    if (currentSort === 'date-asc') {
      return dateA.localeCompare(dateB);
    }
    return dateB.localeCompare(dateA);
  });

  return list;
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('filter-btn--active');
    } else {
      btn.classList.remove('filter-btn--active');
    }
  });
}

function refresh() {
  renderTaskList(getVisibleTodos(), getUiState());
  saveTodos(todos);
}

function addTask(title, date) {
  const nextOrder = todos.reduce((max, task) => Math.max(max, task.order), -1) + 1;

  todos.push({
    id: createTaskId(),
    title,
    date: date || '',
    completed: false,
    order: nextOrder,
  });

  editingId = null;
  pendingDeleteId = null;
  refresh();
}

function deleteTask(id) {
  todos = todos.filter((task) => task.id !== id);
  pendingDeleteId = null;
  if (editingId === id) editingId = null;
  refresh();
}

function updateTask(id, title, date) {
  const task = todos.find((item) => item.id === id);
  if (!task) return;

  task.title = title;
  task.date = date || '';
  editingId = null;
  refresh();
}

function toggleTask(id) {
  const task = todos.find((item) => item.id === id);
  if (!task) return;

  task.completed = !task.completed;
  refresh();
}

function bindEvents() {
  const form = document.getElementById('task-form');
  const list = document.getElementById('task-list');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const filterGroup = document.querySelector('.filter-group');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const titleInput = document.getElementById('task-text');
    const dateInput = document.getElementById('task-date');
    const title = titleInput.value.trim();
    const date = dateInput.value;

    if (!title) {
      setFormMessage('введите текст задачи');
      titleInput.focus();
      return;
    }

    setFormMessage('');
    addTask(title, date);
    form.reset();
    titleInput.focus();
  });

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    refresh();
  });

  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    refresh();
  });

  filterGroup.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    currentFilter = btn.dataset.filter;
    updateFilterButtons();
    refresh();
  });

  list.addEventListener('change', (event) => {
    const checkbox = event.target.closest('.task-item__checkbox');
    if (!checkbox) return;

    const item = checkbox.closest('.task-item');
    if (!item) return;

    toggleTask(item.dataset.id);
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const item = button.closest('.task-item');
    if (!item) return;

    const id = item.dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
      editingId = id;
      pendingDeleteId = null;
      refresh();
      const titleInput = document.querySelector(
        `.task-item[data-id="${CSS.escape(id)}"] .task-item__edit-title`
      );
      if (titleInput) titleInput.focus();
      return;
    }

    if (action === 'cancel-edit') {
      editingId = null;
      refresh();
      return;
    }

    if (action === 'save-edit') {
      const titleInput = item.querySelector('.task-item__edit-title');
      const dateInput = item.querySelector('.task-item__edit-date');
      const title = titleInput.value.trim();

      if (!title) {
        titleInput.focus();
        return;
      }

      updateTask(id, title, dateInput.value);
      return;
    }

    if (action === 'delete') {
      pendingDeleteId = id;
      editingId = null;
      refresh();
      return;
    }

    if (action === 'confirm-delete') {
      deleteTask(id);
      return;
    }

    if (action === 'cancel-delete') {
      pendingDeleteId = null;
      refresh();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  bindEvents();
  updateFilterButtons();
  refresh();
});
