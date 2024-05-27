import type { FormulaCustomFunctionItem, FormulaValueOptions, IFormulaFunction } from '../type';
/**
 * create a formula function
 */
declare function createFormulaFunction(originFuncName: string, valueOptions?: FormulaValueOptions, options?: {
    customFunctions?: Record<string, FormulaCustomFunctionItem>;
}): IFormulaFunction;
/**
 * registor a custom function
 */
declare function registorFormulaFunction(originFuncName: string, item: FormulaCustomFunctionItem, options?: {
    force?: boolean;
    customFunctions?: Record<string, FormulaCustomFunctionItem>;
}): void;
export { createFormulaFunction, registorFormulaFunction };
