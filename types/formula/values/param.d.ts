import { TokenType } from '../type';
import type { IFormulaParam, IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
declare class FormulaParam extends FormulaValue implements IFormulaParam {
    name: string;
    tokenType: TokenType;
    constructor(origText: string, name: string, tokenType: TokenType, options?: FormulaValueOptions);
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaParam;
