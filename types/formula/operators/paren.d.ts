import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
declare class FormulaOperatorPAREN extends AbsFormulaOperator {
    tokenType: TokenType;
    closed: boolean;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaOperatorPAREN;
