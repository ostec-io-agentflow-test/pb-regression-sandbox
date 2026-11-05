import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { handler } from '../src/server.js';

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

async function json(url, options) {
  const response = await fetch(url, options);
  return { response, body: await response.json() };
}

test('GET /todos/stats reports empty and mixed todo states', async () => {
  await withServer(async (baseUrl) => {
    let result = await json(`${baseUrl}/todos/stats`);
    assert.equal(result.response.status, 200);
    assert.deepEqual(result.body, { total: 0, done: 0 });
    assert.deepEqual(Object.keys(result.body).sort(), ['done', 'total']);

    const created = await Promise.all(
      ['one', 'two', 'three'].map((title) =>
        json(`${baseUrl}/todos`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ title }),
        }),
      ),
    );
    await json(`${baseUrl}/todos/${created[0].body.id}`, { method: 'PATCH' });
    await json(`${baseUrl}/todos/${created[2].body.id}`, { method: 'PATCH' });

    result = await json(`${baseUrl}/todos/stats`);
    assert.equal(result.response.status, 200);
    assert.deepEqual(result.body, { total: 3, done: 2 });
  });
});
