import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';
import { listTodos } from '../src/todos.js';

async function postTodo(title) {
  const server = createServer(handler);
  server.listen(0);
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/todos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return { response, body: await response.json() };
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('POST /todos accepts a title with exactly 200 characters', async () => {
  const { response, body } = await postTodo('a'.repeat(200));

  assert.equal(response.status, 201);
  assert.equal(body.title.length, 200);
});

test('POST /todos rejects a title with 201 characters without adding a todo', async () => {
  const countBefore = listTodos().length;
  const { response, body } = await postTodo('a'.repeat(201));

  assert.equal(response.status, 400);
  assert.equal(typeof body.message, 'string');
  assert.equal(listTodos().length, countBefore);
});
