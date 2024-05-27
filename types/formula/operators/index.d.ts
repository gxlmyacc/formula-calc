import { TokenType } from '../type';
import type { FormulaValueOptions, IFormulaOperator } from '../type';
declare function createFormulaOperator(operatorToken: TokenType, origText: string, tokenIndex: number, options?: FormulaValueOptions): IFormulaOperator;
declare function isFormulaOperator(value: any, onSupport?: (value: IFormulaOperator | null) => void): value is IFormulaOperator;
export { createFormulaOperator, isFormulaOperator };
