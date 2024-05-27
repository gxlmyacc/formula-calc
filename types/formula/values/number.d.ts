import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
declare class FormulaNumber extends FormulaValue implements IFormulaValue {
    constructor(origText: string, options?: FormulaValueOptions);
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaNumber;
