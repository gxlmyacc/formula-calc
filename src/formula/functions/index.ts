
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
  abs: { min: 1, max: 1, functionClass: FormulaFunctionABS },
  avg: { min: 1, max: 99, functionClass: FormulaFunctionAVG },
  ceil: { min: 1, max: 1, functionClass: FormulaFunctionCEIL },
  eval: { min: 1, max: 1, functionClass: FormulaFunctionEVAL },
  exist: { min: 2, max: 3, functionClass: FormulaFunctionEXIST },
  floor: { min: 1, max: 1, functionClass: FormulaFunctionFLOOR },
  if: { min: 2, max: 3, functionClass: FormulaFunctionIF },
  max: { min: 1, max: 99, functionClass: FormulaFunctionMAX },
  min: { min: 1, max: 99,  functionClass: FormulaFunctionMIN },
  noref: { min: 1, max: 1,  functionClass: FormulaFunctionNOREF },
  random: { min: 0, max: 1, functionClass: FormulaFunctionRANDOM },
  round: { min: 1, max: 2, functionClass: FormulaFunctionROUND },
  sqrt: { min: 1, max: 1, functionClass: FormulaFunctionSQRT },
  trunc: { min: 1, max: 1, functionClass: FormulaFunctionTRUNC },
  sum: { min: 1, max: 99,  functionClass: FormulaFunctionSUM },
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
