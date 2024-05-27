import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
declare class FormulaOperatorAND extends AbsFormulaOperator {
    tokenType: TokenType;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default FormulaOperatorAND;
