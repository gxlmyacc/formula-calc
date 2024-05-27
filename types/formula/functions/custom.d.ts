import type { IFormulaDataSource, FormulaValueOptions, FormulaCustomFunctionItem } from '../type';
import AbsFormulaFunction from '../base/function';
declare class FormulaFunctionCUSTOM extends AbsFormulaFunction {
    item: FormulaCustomFunctionItem;
    constructor(origText: string, options: FormulaValueOptions, name: string, item: FormulaCustomFunctionItem);
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaFunctionCUSTOM;
