import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { addTodo, listTodos, completeTodo } from '../src/todos.js';
import { handler } from '../src/server.js';

test('adds and completes a todo', () => {
  const t = addTodo('write tests');
  assert.equal(listTodos().at(-1).title, 'write tests');
  assert.equal(completeTodo(t.id).done, true);
});

test('GET /todos?done=true returns only completed todos', async () => {
  for (let index = 0; index < 10; index += 1) {
    const todo = addTodo(`completed ${index}`);
    completeTodo(todo.id);
  }
  addTodo('incomplete');
  const completedLast = addTodo('completed last');
  completeTodo(completedLast.id);

  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/todos?done=true`);
    const todos = await response.json();

    assert.equal(response.status, 200);
    assert.ok(todos.length > 0);
    assert.ok(todos.every((todo) => todo.done));
    assert.ok(todos.some((todo) => todo.id === completedLast.id));
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
