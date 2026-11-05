import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageCount, paginate } from '../src/paginate.js';

test('returns items for 1-based pages', () => {
  const items = [1, 2, 3, 4, 5];

  assert.deepEqual(paginate(items, 1, 2), [1, 2]);
  assert.deepEqual(paginate(items, 2, 2), [3, 4]);
});

test('counts pages', () => {
  assert.equal(pageCount([1, 2, 3, 4, 5], 2), 3);
});
