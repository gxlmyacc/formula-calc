import Formula, { registorFormulaFunction, TokenType } from './formula';
import type { FormulaOptions, IFormulaDataSource, FormulaCustomFunctionItem } from './formula';
export * from './formula/utils';
interface FormulaCalcOptions extends FormulaOptions {
    params?: Record<string, any> | ((name: string) => any);
    customFunctions?: Record<string, FormulaCustomFunctionItem>;
    dataSource?: IFormulaDataSource;
}
declare function formulaCalc(expression: string, options?: FormulaCalcOptions): any;
export { Formula, TokenType, registorFormulaFunction, };
export type { FormulaOptions, IFormulaDataSource };
export default formulaCalc;
