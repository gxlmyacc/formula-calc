import Decimal from 'decimal.js';
import type { FormulaValueOptions, RoundingType } from './type';

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

// function isBoolean(value: any): value is boolean {
//   return typeof value === 'boolean';
// }

function isDecimal(value: any, options: FormulaValueOptions) {
  return (options.Decimal || Decimal).isDecimal(value);
}

function isDecimalValue(value: any, options: FormulaValueOptions) {
  return isDecimal(value, options) || isNumber(value) || (!!options.tryStringToNumber && isStringNumber(value));
}

function isDecimalTrue(value: any, options: FormulaValueOptions) {
  if (isDecimal(value, options)) {
    return !value.isNaN() && !value.isZero();
  }
  return value;
}

function toDecimal(value: any, options: FormulaValueOptions) {
  return isDecimal(value, options)
    ? value
    : isNumber(value) || isStringNumber(value)
      ? new (options.Decimal || Decimal)(value)
      : new (options.Decimal || Decimal)(NaN);
}

function toRounding(rounding: Decimal.Rounding|RoundingType) {
  if (isString(rounding)) {
    const r = (Decimal as any)[rounding] || (Decimal as any)[`ROUND_${rounding}`];
    rounding = r === undefined
      ? Decimal.ROUND_HALF_UP
      : r as Decimal.Rounding;
  }
  return rounding;
}

function toRound(
  value: Decimal.Value,
  decimalPlaces: number = 2,
  rounding: Decimal.Rounding|RoundingType = Decimal.ROUND_HALF_UP,
) {
  return new Decimal(value).toDecimalPlaces(
    decimalPlaces,
    toRounding(rounding)
  );
}

const digitsRE = /(\d{3})(?=\d)/g;
function toFixed(value: Decimal.Value|null|undefined, options: {
  precision?: number|[min: number, max: number],
  comma?: boolean,
  commaStr?: string,
  nullStr?: string,
  trimTrailingZero?: boolean,
  trimTrailingZeroIfInt?: boolean,
  rounding?: Decimal.Rounding|RoundingType,
} = {}) {
  const {
    precision = 2,
    comma, commaStr = ',', nullStr = '',
    trimTrailingZero, trimTrailingZeroIfInt,
    rounding = Decimal.ROUND_HALF_UP,
  } = options;
  value = Decimal.isDecimal(value) ? value : new Decimal(parseFloat(value as any));
  if (value.isNaN() || !value.isFinite()) {
    return nullStr;
  }
  let [min, max] = Array.isArray(precision)
    ? precision
    : [precision, precision];
  if (min < 0) min = 0;
  if (max < 0) max = 0;
  const decimalValue = new Decimal(value);
  const decimalPlaces = min === max
    ? min
    : Decimal.clamp(decimalValue.decimalPlaces(), min, max).toNumber();
  const stringified = decimalValue.abs().toFixed(decimalPlaces, toRounding(rounding));
  let _int = decimalPlaces
    ? stringified.slice(0, -1 - decimalPlaces)
    : stringified;
  if (comma) {
    const i = _int.length % 3;
    const head =  i ? _int.slice(0, i) : '';
    const tail = i ? _int.slice(i) : _int;
    _int = head + (head && tail ? commaStr : '') + tail.replace(digitsRE, '$1' + commaStr);
  }
  let _float = decimalPlaces ? stringified.slice(-1 - decimalPlaces) : '';
  if (decimalValue.isInt()) {
    if (trimTrailingZeroIfInt || trimTrailingZero) {
      _float = _float.replace(/\.0*$/, '');
    }
  } else if (trimTrailingZero) {
    _float = _float.replace(/0*$/, '');
  }
  const sign = decimalValue.isNegative() ? '-' : '';
  return sign + _int + _float;
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

const numberRegex = /^-?(?:(?:\d+(\.\d*)?)|(?:\.\d+))(e[-+]?\d+)?$/i;
function isStringNumber(str: string) {
  return !!str && isString(str) && numberRegex.test(str);
}


export {
  isPlainObject,
  isString,
  isFunction,
  isNumber,
  isPromise,
  // isBoolean,
  isValueType,
  isDecimal,
  isDecimalTrue,
  isDecimalValue,
  toDecimal,
  toRound,
  toFixed,
  hasOwnProp,
  isStringNumber,
  // getTokenTypeByValue,
  getValueByPath,
  nextWithPrimise,
  flatten,
  removeFormArray,
};
