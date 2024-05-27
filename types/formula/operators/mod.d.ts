import Decimal from 'decimal.js';
import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
declare class FormulaOperatorMOD extends AbsFormulaOperator {
    tokenType: TokenType;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): Decimal | Promise<Decimal>;
}
export default FormulaOperatorMOD;
