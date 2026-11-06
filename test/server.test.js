import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';

test('GET /health returns an ok status', () => {
  const response = {
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
  };

  handler({ method: 'GET', url: '/health' }, response);

  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), { status: 'ok' });
});
