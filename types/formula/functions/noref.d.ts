import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
declare class FormulaFunctionNOREF extends AbsFormulaFunction {
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaFunctionNOREF;
