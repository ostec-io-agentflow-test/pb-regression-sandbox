import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageCount } from '../src/paginate.js';

test('counts pages', () => {
  assert.equal(pageCount([1, 2, 3, 4, 5], 2), 3);
});
