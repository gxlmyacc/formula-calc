import Tokenizer from './tokenizer';
import { TokenType, FormulaValues, FormulaValueOptions } from './type';
import type { IFormulaDataSource, IFormulaFunction, FormulaCustomFunctionItem } from './type';
import AbsFormulaFunction from './base/function';
import { registorFormulaFunction } from './functions';
interface FormulaOptions extends FormulaValueOptions {
}
declare class Formula {
    lastError: string;
    origText: string;
    tokenizer: Tokenizer;
    formulas: FormulaValues;
    refs: FormulaValues;
    customFunctions: Record<string, FormulaCustomFunctionItem>;
    constructor();
    registorFunction: typeof registorFormulaFunction;
    clear(): void;
    parse(formula: string, options?: FormulaOptions): void;
    expression(options?: FormulaOptions): void;
    private verifyFormulaCount;
    private verify;
    execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions): any;
}
export { AbsFormulaFunction, registorFormulaFunction, TokenType, };
export type { IFormulaFunction, IFormulaDataSource, FormulaOptions, FormulaCustomFunctionItem, };
export default Formula;
