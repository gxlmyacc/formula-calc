
import type { FormulaCustomFunctionItem, FormulaValueOptions, IFormulaFunction } from '../type';
import { FormulaFunctionItem } from '../base/function';
import FormulaFunctionIF from './if';
import FormulaFunctionSUM from './sum';
import FormulaFunctionAVG from './avg';
import FormulaFunctionMIN from './min';
import FormulaFunctionMAX from './max';
import FormulaFunctionABS from './abs';
import FormulaFunctionROUND from './round';
import FormulaFunctionSQRT from './sqrt';
import FormulaFunctionTRUNC from './trunc';
import FormulaFunctionFLOOR from './floor';
import FormulaFunctionCEIL from './ceil';
import FormulaFunctionRANDOM from './random';
import FormulaFunctionNOREF from './noref';
import FormulaFunctionEVAL from './eval';
import FormulaFunctionEXIST from './exist';
import FormulaFunctionCUSTOM from './custom';

const FormulaFunctionMap: Record<string, FormulaFunctionItem> = {
  ABS: { min: 1, max: 1, functionClass: FormulaFunctionABS },
  AVG: { min: 1, max: 99, functionClass: FormulaFunctionAVG },
  CEIL: { min: 1, max: 1, functionClass: FormulaFunctionCEIL },
  EVAL: { min: 1, max: 1, functionClass: FormulaFunctionEVAL },
  EXIST: { min: 2, max: 3, functionClass: FormulaFunctionEXIST },
  FLOOR: { min: 1, max: 1, functionClass: FormulaFunctionFLOOR },
  IF: { min: 2, max: 3, functionClass: FormulaFunctionIF },
  MAX: { min: 1, max: 99, functionClass: FormulaFunctionMAX },
  MIN: { min: 1, max: 99,  functionClass: FormulaFunctionMIN },
  NOREF: { min: 1, max: 1,  functionClass: FormulaFunctionNOREF },
  RANDOM: { min: 0, max: 1, functionClass: FormulaFunctionRANDOM },
  ROUND: { min: 1, max: 2, functionClass: FormulaFunctionROUND },
  SQRT: { min: 1, max: 1, functionClass: FormulaFunctionSQRT },
  TRUNC: { min: 1, max: 1, functionClass: FormulaFunctionTRUNC },
  SUM: { min: 1, max: 99,  functionClass: FormulaFunctionSUM },
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
  const funcName = originFuncName.toUpperCase();
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
  const funcName = originFuncName.toUpperCase();
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
