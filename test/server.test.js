import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/server.js';

test('GET /health returns an OK status', () => {
  let status;
  let headers;
  let body;
  const res = {
    writeHead(responseStatus, responseHeaders) {
      status = responseStatus;
      headers = responseHeaders;
    },
    end(responseBody) {
      body = responseBody;
    },
  };

  handler({ method: 'GET', url: '/health' }, res);

  assert.equal(status, 200);
  assert.deepEqual(headers, { 'content-type': 'application/json' });
  assert.deepEqual(JSON.parse(body), { status: 'ok' });
});
