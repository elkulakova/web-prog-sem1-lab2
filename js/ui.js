function isOverdue(task) {
  if (task.completed || !task.date) return false;

  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return task.date < todayStr;
}

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

function createTaskElement(task, { editingId = null, pendingDeleteId = null } = {}) {
  const isEditing = editingId === task.id;
  const isPendingDelete = pendingDeleteId === task.id;

  const item = createElement('li', {
    className: [
      'task-item',
      task.completed ? 'task-item--completed' : '',
      isOverdue(task) ? 'task-item--overdue' : '',
      isEditing ? 'task-item--editing' : '',
      isPendingDelete ? 'task-item--pending-delete' : '',
    ].filter(Boolean).join(' '),
    dataset: { id: task.id },
    attrs: {
      draggable: String(!isEditing && !isPendingDelete),
    },
  });

  const checkbox = createElement('input', {
    className: 'task-item__checkbox',
    attrs: {
      type: 'checkbox',
      checked: task.completed,
      disabled: isEditing || isPendingDelete,
    },
  });

  let content;
  let actions;

  if (isEditing) {
    content = createElement('div', {
      className: 'task-item__content task-item__content--edit',
      children: [
        createElement('input', {
          className: 'task-item__edit-title',
          attrs: {
            type: 'text',
            value: task.title,
          },
        }),
        createElement('input', {
          className: 'task-item__edit-date',
          attrs: {
            type: 'date',
            value: task.date || '',
          },
        }),
      ],
    });

    actions = createElement('div', {
      className: 'task-item__actions',
      children: [
        createElement('button', {
          className: 'task-item__btn task-item__btn--save',
          text: 'сохранить',
          attrs: { type: 'button' },
          dataset: { action: 'save-edit' },
        }),
        createElement('button', {
          className: 'task-item__btn task-item__btn--cancel',
          text: 'отмена',
          attrs: { type: 'button' },
          dataset: { action: 'cancel-edit' },
        }),
      ],
    });
  } else if (isPendingDelete) {
    content = createElement('div', {
      className: 'task-item__content',
      children: [
        createElement('span', {
          className: 'task-item__title',
          text: task.title,
        }),
        createElement('p', {
          className: 'task-item__confirm',
          text: 'удалить эту задачу?',
        }),
      ],
    });

    actions = createElement('div', {
      className: 'task-item__actions',
      children: [
        createElement('button', {
          className: 'task-item__btn task-item__btn--confirm-delete',
          text: 'да',
          attrs: { type: 'button' },
          dataset: { action: 'confirm-delete' },
        }),
        createElement('button', {
          className: 'task-item__btn task-item__btn--cancel',
          text: 'нет',
          attrs: { type: 'button' },
          dataset: { action: 'cancel-delete' },
        }),
      ],
    });
  } else {
    content = createElement('div', {
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

    actions = createElement('div', {
      className: 'task-item__actions',
      children: [
        createElement('button', {
          className: 'task-item__btn task-item__btn--edit',
          text: 'изменить',
          attrs: { type: 'button' },
          dataset: { action: 'edit' },
        }),
        createElement('button', {
          className: 'task-item__btn task-item__btn--delete',
          text: 'удалить',
          attrs: { type: 'button' },
          dataset: { action: 'delete' },
        }),
      ],
    });
  }

  item.append(checkbox, content, actions);
  return item;
}

function renderTaskList(tasks, uiState = {}) {
  const list = document.getElementById('task-list');
  if (!list) return;

  if (!tasks.length) {
    list.replaceChildren(
      createElement('li', {
        className: 'task-list__empty',
        text: 'задач пока нет',
      })
    );
    return;
  }

  const items = tasks.map((task) => createTaskElement(task, uiState));
  list.replaceChildren(...items);
}

function setFormMessage(message) {
  const box = document.getElementById('form-message');
  if (!box) return;

  box.textContent = message || '';
  box.className = message ? 'form-message form-message--error' : 'form-message';
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

  const labelTask = createElement('label', {
    className: 'visually-hidden',
    text: 'текст задачи',
    attrs: { for: 'task-text' },
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
    },
  });

  const labelDate = createElement('label', {
    className: 'visually-hidden',
    text: 'дата задачи',
    attrs: { for: 'task-date' },
  });

  const inputDate = createElement('input', {
    className: 'task-form__date',
    attrs: {
      type: 'date',
      id: 'task-date',
      name: 'date',
    },
  });

  const addBtn = createElement('button', {
    className: 'task-form__submit',
    text: 'добавить',
    attrs: { type: 'submit' },
  });

  const formMessage = createElement('p', {
    className: 'form-message',
    attrs: { id: 'form-message' },
  });

  form.append(labelTask, inputTask, labelDate, inputDate, addBtn, formMessage);

  const controls = createElement('section', {
    className: 'controls',
  });

  const labelSearch = createElement('label', {
    className: 'visually-hidden',
    text: 'поиск задач',
    attrs: { for: 'search-input' },
  });

  const searchInput = createElement('input', {
    className: 'controls__search',
    attrs: {
      type: 'search',
      id: 'search-input',
      placeholder: 'поиск задач...',
    },
  });

  const filterGroup = createElement('div', {
    className: 'filter-group',
  });

  const filters = [
    { label: 'все', value: 'all' },
    { label: 'активные', value: 'active' },
    { label: 'выполненные', value: 'completed' },
    { label: 'просроченные', value: 'overdue' },
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

  const labelSort = createElement('label', {
    className: 'visually-hidden',
    text: 'сортировка задач',
    attrs: { for: 'sort-select' },
  });

  const sortSelect = createElement('select', {
    className: 'controls__sort',
    attrs: { id: 'sort-select' },
  });

  [
    { label: 'свой порядок', value: 'manual' },
    { label: 'сначала новые', value: 'date-desc' },
    { label: 'сначала старые', value: 'date-asc' },
    { label: 'сначала просроченные', value: 'overdue-first' },
  ].forEach((opt) => {
    sortSelect.append(
      createElement('option', {
        text: opt.label,
        attrs: { value: opt.value },
      })
    );
  });

  controls.append(labelSearch, searchInput, filterGroup, labelSort, sortSelect);

  const taskListSection = createElement('section', {
    className: 'task-section',
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
