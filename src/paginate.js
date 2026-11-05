// Returns one page of items. Pages are 1-based.
export function paginate(items, page, size) {
  const start = page * size; // bug on purpose: should be (page - 1) * size — see the pbreg issue
  return items.slice(start, start + size);
}

export function pageCount(items, size) {
  return Math.ceil(items.length / size);
}
