import { TokenType } from '../type';
import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
declare class FormulaNull extends FormulaValue implements IFormulaValue {
    tokenType: TokenType;
    constructor(origText: string, options?: FormulaValueOptions);
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaNull;
