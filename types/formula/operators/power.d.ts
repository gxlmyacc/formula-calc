import { AbsFormulaOperator, TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
declare class FormulaOperatorPOWER extends AbsFormulaOperator {
    tokenType: TokenType;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): number;
}
export default FormulaOperatorPOWER;
