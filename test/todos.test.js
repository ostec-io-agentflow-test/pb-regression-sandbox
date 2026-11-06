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

test('GET /todos/stats returns JSON counts after todos are completed', async (t) => {
  const before = listTodos();
  const expected = {
    total: before.length + 2,
    done: before.filter((todo) => todo.done).length + 1,
  };
  const first = addTodo('first stats todo');
  addTodo('second stats todo');
  completeTodo(first.id);

  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/todos/stats`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.deepEqual(await response.json(), expected);
});
