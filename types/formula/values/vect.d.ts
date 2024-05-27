import { FormulaValue, TokenType } from '../type';
import type { IFormulaVect, IFormulaCell, IFormulaDataSource, FormulaValueOptions } from '../type';
declare class FormulaVect extends FormulaValue implements IFormulaVect {
    table: string;
    cells: IFormulaCell[];
    isArea: boolean;
    get tokenType(): TokenType.ttVectL | TokenType.ttArea;
    constructor(origText: string, options?: FormulaValueOptions, isArea?: boolean);
    addCell(cell: string | IFormulaCell, options?: FormulaValueOptions): void;
    addArea(areaStr: string, options?: FormulaValueOptions): void;
    execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaVect;
