import { TokenType } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaOperator from '../base/operator';
declare class FormulaOperatorGE extends AbsFormulaOperator {
    tokenType: TokenType;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): boolean | Promise<boolean>;
}
export default FormulaOperatorGE;
