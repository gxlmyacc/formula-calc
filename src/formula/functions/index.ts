
import type { FormulaCustomFunctionItem, FormulaValueOptions, IFormulaFunction } from '../type';
import { FormulaFunctionItem } from '../base/function';
import FormulaFunctionIF from './if';
import FormulaFunctionSUM from './sum';
import FormulaFunctionAVG from './avg';
import FormulaFunctionMIN from './min';
import FormulaFunctionMAX from './max';
import FormulaFunctionROUND from './round';
import FormulaFunctionRANDOM from './random';
import FormulaFunctionNOREF from './noref';
import FormulaFunctionEVAL from './eval';
import FormulaFunctionEXIST from './exist';
import FormulaFunctionCUSTOM from './custom';
import FormulaFunctionDecimal from './decimal';
import FormulaFunctionCAST, { CAST_MAP } from './cast';
import FormulaFunctionCONCAT from './concat';

const OneArgDecimalMethods = [
  'abs',
  'acos',
  'acosh',
  'asin',
  'asinh',
  'atan',
  'atanh',
  { name: 'atan2', min: 2, max: 2 },
  'cbrt',
  'ceil',
  { name: 'clamp', min: 3, max: 3 },
  'cos',
  'cosh',
  'floor',
  { name: 'hypot', min: 1, max: 99 },
  'ln',
  'log',
  'log10',
  'log2',
  'sign',
  'sin',
  'sinh',
  'sqrt',
  'tan',
  'tanh',
  'trunc'
] as const;

const FormulaFunctionDecimalMap = OneArgDecimalMethods.reduce((p, v) => {
  const item = typeof v === 'string'
    ? { min: 1, max: 1, name: v }
    : v;
  p[item.name] = { min: item.min, max: item.max, functionClass: FormulaFunctionDecimal };
  return p;
}, {} as Record<string, FormulaFunctionItem>);

const FormulaFunctionCastMap = Object.keys(CAST_MAP).reduce((p, v) => {
  p[v] = { min: 1, max: 1, functionClass: FormulaFunctionCAST };
  return p;
}, {} as Record<string, FormulaFunctionItem>);

const FormulaFunctionMap: Record<string, FormulaFunctionItem> = {
  avg: { min: 1, max: 99, functionClass: FormulaFunctionAVG },
  eval: { min: 1, max: 1, functionClass: FormulaFunctionEVAL },
  exist: { min: 2, max: 3, functionClass: FormulaFunctionEXIST },
  if: { min: 2, max: 3, functionClass: FormulaFunctionIF },
  max: { min: 1, max: 99, functionClass: FormulaFunctionMAX },
  min: { min: 1, max: 99,  functionClass: FormulaFunctionMIN },
  noref: { min: 1, max: 1,  functionClass: FormulaFunctionNOREF },
  random: { min: 0, max: 1, functionClass: FormulaFunctionRANDOM },
  round: { min: 1, max: 2, functionClass: FormulaFunctionROUND },
  sum: { min: 1, max: 99,  functionClass: FormulaFunctionSUM },
  concat: { min: 1, max: 99,  functionClass: FormulaFunctionCONCAT },
  ...FormulaFunctionDecimalMap,
  ...FormulaFunctionCastMap,
};

const FormulaCustomFunctionMap: Record<string, FormulaCustomFunctionItem> = {

};

function isFormulaFunction(func: any): func is FormulaFunctionItem {
  return func.functionClass;
}

/**
 * create a formula function
 */
function createFormulaFunction(
  originFuncName: string,
  valueOptions: FormulaValueOptions,
  options: {
    customFunctions?: Record<string, FormulaCustomFunctionItem>,
  }
): IFormulaFunction {
  const { customFunctions } = options;
  const funcName = originFuncName;
  const item = customFunctions?.[funcName]
    || FormulaCustomFunctionMap[funcName]
    || FormulaFunctionMap[funcName];
  if (!item) {
    throw new Error(`unsupported function: "${originFuncName}"`);
  }
  if (isFormulaFunction(item)) {
    const FunctionClass = item.functionClass;
    // @ts-ignore
    return new FunctionClass(funcName, valueOptions, funcName, item.min, item.max);
  }

  return new FormulaFunctionCUSTOM(funcName, valueOptions, funcName, item);
}


/**
 * registor a custom function
 */
function registorFormulaFunction(originFuncName: string, item: FormulaCustomFunctionItem, options: {
  force?: boolean,
  customFunctions?: Record<string, FormulaCustomFunctionItem>,
} = {}) {
  const { force, customFunctions } = options;
  const funcName = originFuncName;
  if (FormulaCustomFunctionMap[funcName] && !force) {
    throw new Error(`registor custom function fail: "${originFuncName}" already exist!`);
  }
  if (customFunctions) customFunctions[funcName] = item;
  else FormulaCustomFunctionMap[funcName] = item;
}

export {
  createFormulaFunction,
  registorFormulaFunction
};
