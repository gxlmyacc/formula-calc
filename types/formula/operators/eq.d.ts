import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
declare class FormulaOperatorLE extends AbsFormulaOperator {
    tokenType: TokenType;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): boolean | Promise<boolean>;
}
export default FormulaOperatorLE;
