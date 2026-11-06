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

test('GET /todos/stats reports total and completed todos as JSON', async (t) => {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const createTodo = async (title) => {
    const response = await fetch(`${baseUrl}/todos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return response.json();
  };

  const incomplete = await createTodo('leave unfinished');
  const completed = await createTodo('finish this');
  completeTodo(completed.id);

  const response = await fetch(`${baseUrl}/todos/stats`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.equal(await response.text(), '{"total":3,"done":2}');
  assert.equal(incomplete.done, false);
});
