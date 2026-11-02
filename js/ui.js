function createElement(tag, { className, text, attrs = {}, dataset = {}, children = [] } = {}) {
  const el = document.createElement(tag);

  if (className) {
    el.className = className;
  }

  if (text != null) {
    el.textContent = text;
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value == null) return;
    if (value === true) {
      el.setAttribute(key, '');
      return;
    }
    el.setAttribute(key, String(value));
  });

  Object.entries(dataset).forEach(([key, value]) => {
    el.dataset[key] = value;
  });

  children.forEach((child) => {
    if (child != null) el.append(child);
  });

  return el;
}

function createTaskElement(task) {
  const item = createElement('li', {
    className: `task-item${task.completed ? ' task-item--completed' : ''}`,
    dataset: { id: task.id },
    attrs: {
      draggable: 'true',
    },
  });

  const checkbox = createElement('input', {
    className: 'task-item__checkbox',
    attrs: {
      type: 'checkbox',
      checked: task.completed,
      disabled: true,
      'aria-label': 'статус выполнения',
    },
  });

  const content = createElement('div', {
    className: 'task-item__content',
    children: [
      createElement('span', {
        className: 'task-item__title',
        text: task.title,
      }),
      createElement('time', {
        className: 'task-item__date',
        text: task.date || 'без даты',
        attrs: task.date ? { datetime: task.date } : {},
      }),
    ],
  });

  const actions = createElement('div', {
    className: 'task-item__actions',
    children: [
      createElement('button', {
        className: 'task-item__btn task-item__btn--edit',
        text: 'изменить',
        attrs: {
          type: 'button',
          disabled: true,
        },
      }),
      createElement('button', {
        className: 'task-item__btn task-item__btn--delete',
        text: 'удалить',
        attrs: {
          type: 'button',
          disabled: true,
        },
      }),
    ],
  });

  item.append(checkbox, content, actions);
  return item;
}

function renderTaskList(tasks) {
  const list = document.getElementById('task-list');
  if (!list) return;

  const items = tasks.map(createTaskElement);
  list.replaceChildren(...items);
}

function renderApp() {
  const app = createElement('div', { className: 'todo-app' });

  const header = createElement('header', {
    className: 'header',
    children: [
      createElement('h1', { className: 'header__title', text: 'To-Do List' }),
      createElement('p', {
        className: 'header__subtitle',
        text: 'приложение для фиксации и планирования задач',
      }),
    ],
  });

  const main = createElement('main', { className: 'main' });

  const form = createElement('form', {
    className: 'task-form',
    attrs: { id: 'task-form', novalidate: true },
  });

  const inputTask = createElement('input', {
    className: 'task-form__input',
    attrs: {
      type: 'text',
      id: 'task-text',
      name: 'title',
      placeholder: 'моя задача...',
      required: true,
      autocomplete: 'off',
      'aria-label': 'текст задачи',
    },
  });

  const inputDate = createElement('input', {
    className: 'task-form__date',
    attrs: {
      type: 'date',
      id: 'task-date',
      name: 'date',
      'aria-label': 'дата задачи',
    },
  });

  const addBtn = createElement('button', {
    className: 'task-form__submit',
    text: 'добавить',
    attrs: { type: 'submit' },
  });

  form.append(inputTask, inputDate, addBtn);

  const controls = createElement('section', {
    className: 'controls',
    attrs: { 'aria-label': 'фильтры и поиск' },
  });

  const searchInput = createElement('input', {
    className: 'controls__search',
    attrs: {
      type: 'search',
      id: 'search-input',
      placeholder: 'поиск задач...',
      'aria-label': 'поиск по названию',
    },
  });

  const filterGroup = createElement('div', {
    className: 'filter-group',
    attrs: { role: 'group', 'aria-label': 'фильтр по статусу' },
  });

  const filters = [
    { label: 'все', value: 'all' },
    { label: 'активные', value: 'active' },
    { label: 'выполненные', value: 'completed' },
  ];

  filters.forEach((filter, index) => {
    filterGroup.append(
      createElement('button', {
        className: `filter-btn${index === 0 ? ' filter-btn--active' : ''}`,
        text: filter.label,
        attrs: { type: 'button' },
        dataset: { filter: filter.value },
      })
    );
  });

  const sortSelect = createElement('select', {
    className: 'controls__sort',
    attrs: {
      id: 'sort-select',
      'aria-label': 'сортировка по дате',
    },
  });

  [
    { label: 'сначала новые', value: 'date-desc' },
    { label: 'сначала старые', value: 'date-asc' },
  ].forEach((opt) => {
    sortSelect.append(
      createElement('option', {
        text: opt.label,
        attrs: { value: opt.value },
      })
    );
  });

  controls.append(searchInput, filterGroup, sortSelect);

  const taskListSection = createElement('section', {
    className: 'task-section',
    attrs: { 'aria-label': 'список задач' },
    children: [
      createElement('ul', {
        className: 'task-list',
        attrs: { id: 'task-list' },
      }),
    ],
  });

  main.append(form, controls, taskListSection);
  app.append(header, main);
  document.body.append(app);
}
