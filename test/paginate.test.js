import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageCount, paginate } from '../src/paginate.js';

test('returns the first 1-based page', () => {
  assert.deepEqual(paginate([1, 2, 3, 4, 5], 1, 2), [1, 2]);
});

test('returns subsequent 1-based pages', () => {
  assert.deepEqual(paginate([1, 2, 3, 4, 5], 2, 2), [3, 4]);
});

test('counts pages', () => {
  assert.equal(pageCount([1, 2, 3, 4, 5], 2), 3);
});
