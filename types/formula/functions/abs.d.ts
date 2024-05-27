import Decimal from 'decimal.js';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
declare class FormulaFunctionABS extends AbsFormulaFunction {
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): Decimal | Promise<Decimal>;
}
export default FormulaFunctionABS;
