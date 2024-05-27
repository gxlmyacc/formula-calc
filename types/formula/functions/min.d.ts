import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
declare class FormulaFunctionMIN extends AbsFormulaFunction {
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): void | Promise<void>;
}
export default FormulaFunctionMIN;
