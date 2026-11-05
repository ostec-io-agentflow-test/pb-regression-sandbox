import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { handler } from '../src/server.js';
import { listTodos } from '../src/todos.js';

let server;
let baseUrl;

before(async () => {
  server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function createTodo(title) {
  return fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

test('rejects a title longer than 200 characters without persisting it', async () => {
  const beforeCount = listTodos().length;
  const response = await createTodo('x'.repeat(201));

  assert.equal(response.status, 400);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  const payload = await response.json();
  assert.equal(typeof payload.error, 'string');
  assert.notEqual(payload.error.length, 0);
  assert.equal(listTodos().length, beforeCount);
});

test('accepts a title of exactly 200 characters', async () => {
  const title = 'x'.repeat(200);
  const response = await createTodo(title);

  assert.equal(response.status, 201);
  assert.equal((await response.json()).title, title);
});
