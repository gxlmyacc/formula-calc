import { FormulaValues } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
declare function sumExecute(params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions, onWalk?: (itemValue: any, index: number, isArray: boolean) => void): void | Promise<void>;
declare class FormulaFunctionSUM extends AbsFormulaFunction {
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): void | Promise<void>;
}
export { sumExecute };
export default FormulaFunctionSUM;
