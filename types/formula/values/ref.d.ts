import { FormulaValues, TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
declare class FormulaRef extends FormulaValue {
    tokenType: TokenType;
    refs: FormulaValues;
    order: number;
    constructor(origText: string, refs: FormulaValues, options?: FormulaValueOptions);
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaRef;
