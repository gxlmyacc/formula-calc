import { TokenType } from '../type';
import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
declare class FormulaString extends FormulaValue implements IFormulaValue {
    tokenType: TokenType;
    constructor(origText: string, value: string, options?: FormulaValueOptions);
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaString;
