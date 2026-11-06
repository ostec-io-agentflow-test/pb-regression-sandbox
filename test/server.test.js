import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';
import { listTodos } from '../src/todos.js';

async function withServer(callback) {
  const server = createServer(handler).listen(0);
  await once(server, 'listening');
  try {
    return await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

async function createTodo(baseUrl, title) {
  return fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

test('POST /todos rejects titles longer than 200 characters without adding a todo', async () => {
  await withServer(async (baseUrl) => {
    const before = listTodos().length;
    const response = await createTodo(baseUrl, 'x'.repeat(201));

    assert.equal(response.status, 400);
    assert.match(response.headers.get('content-type'), /^application\/json/);
    assert.match((await response.json()).error, /200 characters or fewer/);
    assert.equal(listTodos().length, before);
  });
});

test('POST /todos accepts a title of exactly 200 characters', async () => {
  await withServer(async (baseUrl) => {
    const title = 'x'.repeat(200);
    const response = await createTodo(baseUrl, title);

    assert.equal(response.status, 201);
    assert.equal((await response.json()).title, title);
  });
});
