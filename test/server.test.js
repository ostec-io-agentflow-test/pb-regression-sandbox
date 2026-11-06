import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handler } from '../src/server.js';
import { addTodo } from '../src/todos.js';

async function withServer(run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test('GET /todos/:id returns the requested todo', async () => {
  const todo = addTodo('write endpoint tests');

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/todos/${todo.id}`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), todo);
  });
});

test('GET /todos/:id returns 404 when the todo does not exist', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/todos/999999`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'not found' });
  });
});
