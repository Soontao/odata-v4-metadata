function replacer(key, value) {
  if (key !== 'parent') { return value; }
}

export function jsonStringify(object) {
  return JSON.stringify(object, replacer);
}
