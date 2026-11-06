const todos = [];
let nextId = 1;

export function addTodo(title) {
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

export function listTodos(done) {
  return todos.filter((todo) => done === undefined || todo.done === done);
}

export function completeTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = true;
  return todo;
}
