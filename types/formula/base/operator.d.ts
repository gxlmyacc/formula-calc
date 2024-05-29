import type { FormulaValueOptions, IFormulaOperator, FormulaOperatorType } from '../type';
import AbsFormulaBase from './base';
declare abstract class AbsFormulaOperator extends AbsFormulaBase implements IFormulaOperator {
    tokenIndex: number;
    priority: number;
    operatorType: FormulaOperatorType;
    constructor(origText: string, tokenIndex: number, options: FormulaValueOptions, operatorType: FormulaOperatorType, priority: number);
}
export default AbsFormulaOperator;
