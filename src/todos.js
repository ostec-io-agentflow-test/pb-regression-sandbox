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

export function todoStats() {
  return {
    total: todos.length,
    done: todos.filter((todo) => todo.done).length,
  };
}

export function completeTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = true;
  return todo;
}
