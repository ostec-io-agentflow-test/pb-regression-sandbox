import { createServer } from 'node:http';
import { addTodo, completeTodo, getTodoStats, listTodos } from './todos.js';
import { paginate } from './paginate.js';

export function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/todos') {
    const page = Number(url.searchParams.get('page') ?? 1);
    return send(res, 200, paginate(listTodos(), page, 10));
  }
  if (req.method === 'GET' && url.pathname === '/todos/stats') {
    return send(res, 200, getTodoStats());
  }
  if (req.method === 'POST' && url.pathname === '/todos') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => send(res, 201, addTodo(JSON.parse(body || '{}').title)));
    return;
  }
  const completeMatch = url.pathname.match(/^\/todos\/(\d+)$/);
  if (req.method === 'PATCH' && completeMatch) {
    const todo = completeTodo(Number(completeMatch[1]));
    return send(res, todo ? 200 : 404, todo ?? { error: 'not found' });
  }
  send(res, 404, { error: 'not found' });
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer(handler).listen(process.env.PORT ?? 3000);
}
