import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';

test('GET /health returns an ok status', () => {
  let status;
  let body;
  const res = {
    writeHead(code) {
      status = code;
    },
    end(value) {
      body = value;
    },
  };

  handler({ method: 'GET', url: '/health' }, res);

  assert.equal(status, 200);
  assert.deepEqual(JSON.parse(body), { status: 'ok' });
});
