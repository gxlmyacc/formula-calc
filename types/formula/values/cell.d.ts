import { FormulaValue, TokenType } from '../type';
import type { IFormulaCell, IFormulaDataSource, FormulaValueOptions } from '../type';
declare class FormulaCell extends FormulaValue implements IFormulaCell {
    table: string;
    colText: string;
    rowText: string;
    row: number;
    col: number;
    tokenType: TokenType;
    constructor(origText: string, options?: FormulaValueOptions, cellInfo?: {
        row: number;
        col: number;
        rowText: string;
        colText: string;
        table?: string;
    });
    execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaCell;
