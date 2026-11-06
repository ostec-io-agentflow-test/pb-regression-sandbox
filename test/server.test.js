import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';

test('GET /health returns ok status', () => {
  let status;
  let body;
  const res = {
    writeHead(value) {
      status = value;
    },
    end(value) {
      body = value;
    },
  };

  handler({ method: 'GET', url: '/health' }, res);

  assert.equal(status, 200);
  assert.deepEqual(JSON.parse(body), { status: 'ok' });
});
