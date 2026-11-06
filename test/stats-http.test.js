import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';
import { addTodo, completeTodo } from '../src/todos.js';

async function requestStats() {
  const server = createServer(handler);
  server.listen(0);
  await once(server, 'listening');

  try {
    return await fetch(`http://127.0.0.1:${server.address().port}/todos/stats`);
  } finally {
    server.close();
  }
}

test('GET /todos/stats reports an empty collection as JSON', async () => {
  const response = await requestStats();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.deepEqual(await response.json(), { total: 0, done: 0 });
});

test('GET /todos/stats counts total and completed todos', async () => {
  const completed = addTodo('finished task');
  addTodo('open task');
  completeTodo(completed.id);

  const response = await requestStats();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.deepEqual(await response.json(), { total: 2, done: 1 });
});
