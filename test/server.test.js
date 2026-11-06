import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';
import { listTodos } from '../src/todos.js';

let server;
let baseUrl;

before(async () => {
  server = createServer(handler);
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

async function createTodo(title) {
  return fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

test('POST /todos accepts a 200-character title', async () => {
  const response = await createTodo('a'.repeat(200));

  assert.equal(response.status, 201);
  assert.equal((await response.json()).title.length, 200);
});

test('POST /todos rejects a title longer than 200 characters without persisting it', async () => {
  const todoCount = listTodos().length;
  const response = await createTodo('a'.repeat(201));

  assert.equal(response.status, 400);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.match((await response.json()).error, /200 characters or fewer/);
  assert.equal(listTodos().length, todoCount);
});
