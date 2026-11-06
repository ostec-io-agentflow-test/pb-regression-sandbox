const todos = [];
let nextId = 1;

export function addTodo(title) {
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

export function listTodos() {
  return [...todos];
}

export function getTodo(id) {
  return todos.find((todo) => todo.id === id);
}

export function completeTodo(id) {
  const todo = getTodo(id);
  if (todo) todo.done = true;
  return todo;
}
