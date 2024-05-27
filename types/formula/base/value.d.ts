import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions } from '../type';
import { FormulaExecuteState, TokenType } from '../type';
declare abstract class FormulaValue implements IFormulaValue {
    origText: string;
    value: any;
    state: FormulaExecuteState;
    options: FormulaValueOptions;
    tokenType: TokenType;
    protected abstract _execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions): any;
    execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
    constructor(origText: string, options?: FormulaValueOptions);
}
export default FormulaValue;
