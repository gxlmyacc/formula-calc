import Decimal from 'decimal.js';
import type { RoundingType } from './type';

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

function toRound(
  value: Decimal.Value,
  decimalPlaces: number = 2,
  rounding: Decimal.Rounding|RoundingType = Decimal.ROUND_HALF_UP
) {
  const result = new Decimal(value);
  let _rounding = isNumber(rounding)
    ? rounding
    : Decimal.ROUND_HALF_UP;
  if (isString(rounding)) {
    const r = (Decimal as any)[rounding] || (Decimal as any)[`ROUND_${rounding}`];
    if (isNumber(r)) _rounding = r as Decimal.Rounding;
  }
  return Number(result.toFixed(
    decimalPlaces,
    _rounding
  ));
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
  onNotFind?: (
    path: string,
    options: {
      paresedPath: string,
      pre: any,
      isLeaf: boolean,
      paths: string[],
  }) => void,
  defaultValue?: any,
) {
  let paresedPath = '';
  let value: any;
  let pre = data;
  let paths = path.split('.');
  let isLeaf = false;
  paths.some((path, index) => {
    isLeaf = index === paths.length - 1;
    let optional = false;
    if (path.endsWith('?')) {
      optional = true;
      path = path.slice(0, -1);
    }
    if (pre && (optional || hasOwnProp(pre, path))) {
      paresedPath += `${paresedPath ? '.' : ''}${path}`;
      pre = value = pre[path];
      return pre && (typeof pre === 'object' || Array.isArray(pre))
        ? false
        : optional;
    }
    value = defaultValue;
    if (onNotFind) {
      value = onNotFind(path, { paresedPath, pre, isLeaf, paths });
    }
    return true;
  });
  return value;
}

function isValueType(value: any, type: 'bool'|'boolean'|'string'|'array'|'number'|'NaN'|'Infinity'|'null'|'object') {
  switch (type) {
    case 'bool':
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string';
    case 'number':
      return ['number', 'bigint'].includes(typeof value);
    case 'NaN':
      return isNaN(value);
    case 'null':
      return value === null;
    case 'Infinity':
      return value === Infinity;
    case 'array':
      return Array.isArray(value);
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

function removeFormArray<T>(array: T[], value: T) {
  let idx = array.indexOf(value);
  let find = idx > -1;
  if (find) {
    array.splice(idx, 1);
  }
  return find;
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
  removeFormArray,
};
