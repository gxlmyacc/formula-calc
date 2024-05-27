import Decimal from 'decimal.js';
// import { TokenType } from './type';

const _toString = Object.prototype.toString;
function isPlainObject(obj: any): obj is Record<string, any> {
  return _toString.call(obj) === '[object Object]';
}

const _hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwnProp(obj: any, key: PropertyKey) {
  return Boolean(obj) && _hasOwnProperty.call(obj, key);
}

function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

function isString(value: any): value is string {
  return typeof value === 'string';
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function toRound(value: Decimal.Value, decimalPlaces: number = 2, rounding: Decimal.Rounding = Decimal.ROUND_HALF_UP) {
  const result = new Decimal(value);
  return Number(result.toFixed(decimalPlaces, rounding));
}

// function getTokenTypeByValue(value: any) {
//   switch (typeof value) {
//     case 'number':
//       return isNaN(value) ? TokenType.ttNaN : TokenType.ttNumber;
//     case 'string':
//       return TokenType.ttString;
//     case 'boolean':
//       return TokenType.ttBool;
//     case 'object':
//       if (value === null) {
//         return TokenType.ttNull;
//       }
//       return TokenType.ttNone;
//     default:
//       return TokenType.ttNone;
//   }
// }

function getValueByPath(
  data: Record<string, any>,
  path: string,
  onNotFind?: (path: string, paresedPath: string, pre: any) => void,
) {
  let paresedPath = '';
  let value: any;
  let pre = data;
  path.split('.').some(path => {
    if (pre && typeof pre === 'object' && hasOwnProp(pre, path)) {
      paresedPath += `${paresedPath ? '.' : ''}${path}`;
      pre = value = pre[path];
      return;
    }
    value = undefined;
    if (onNotFind) {
      onNotFind(path, paresedPath, pre);
    }
    return true;
  });
  return value;
}

function isValueType(value: any, type: 'bool'|'boolean'|'string'|'number'|'null'|'object') {
  switch (type) {
    case 'bool':
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'null':
      return value === null;
    case 'object':
      return typeof value === 'object';
    default:
      return false;
  }
}

function isPromise(v: any): v is Promise<any> {
  return v?.then;
}

function nextWithPrimise<T, R>(
  proms: T,
  next: (...args: any[]) => R = v => v,
  spread: boolean = true
): R|Promise<R> {
  if (Array.isArray(proms)) {
    let promCount = proms.reduce((p, v) => (isPromise(v) ? p + 1 : p), 0);
    // eslint-disable-next-line arrow-body-style
    const _next = (proms: any[]) => {
      return spread ? next(...proms) : next(proms);
    };
    if (!promCount) {
      return _next(proms);
    }
    return Promise.all(proms).then(_next);
  }
  return isPromise(proms)
    ? proms.then(v => next(v))
    : next(proms);
}

function flatten(array: any[]) {
  const flattend: any[] = [];
  (function flat(array) {
    array.forEach(function (el) {
      if (Array.isArray(el)) flat(el);
      else flattend.push(el);
    });
  })(array);
  return flattend;
}

export {
  isPlainObject,
  isString,
  isFunction,
  isNumber,
  isPromise,
  isValueType,
  toRound,
  hasOwnProp,
  // getTokenTypeByValue,
  getValueByPath,
  nextWithPrimise,
  flatten,
};
