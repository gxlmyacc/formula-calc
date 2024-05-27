import Decimal from 'decimal.js';
import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
declare class FormulaOperatorADD extends AbsFormulaOperator {
    tokenType: TokenType;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): Decimal | Promise<Decimal>;
}
export default FormulaOperatorADD;
