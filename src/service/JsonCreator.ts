// @ts-nocheck
import { getJsonProperty } from '../metacode';

function replaceObject<T = any>(value: T): T {

  if (typeof value === 'object') {
    if (value.toJson !== undefined) {
      return value.toJson();
    }
    if (value instanceof Array) {
      if (value.length === 0) {
        return undefined;
      }
      // @ts-ignore
      return value.map(replaceObject);
    }
    const replaceKeys = [];
    Object.keys(value).forEach((key) => {
      if (key !== undefined && key !== null) {
        const targetProperty = getJsonProperty(value, key);
        if (targetProperty !== undefined) {
          if (targetProperty !== key) {
            replaceKeys.push({ from: key, to: targetProperty });
          }
        }
      }
    });
    if (replaceKeys.length > 0) {
      const tmp = { ...value };
      replaceKeys.forEach(({ from, to }) => {
        tmp[to] = tmp[from];
        delete tmp[from];
      });
      return tmp;
    }
    return value;
  }

  return value;

}

function replacer(key: string, value: any) {
  if (key === 'parent') { return undefined; }

  return replaceObject(value);
}

export function jsonStringify(object) {
  return JSON.stringify(object, replacer);
}
