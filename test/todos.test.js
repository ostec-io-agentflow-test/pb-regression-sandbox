import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTodo, listTodos, completeTodo } from '../src/todos.js';

test('adds and completes a todo', () => {
  const t = addTodo('write tests');
  assert.equal(listTodos().at(-1).title, 'write tests');
  assert.equal(completeTodo(t.id).done, true);
});
