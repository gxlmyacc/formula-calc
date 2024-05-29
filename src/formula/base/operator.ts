import type { FormulaValueOptions, IFormulaOperator, FormulaOperatorType } from '../type';
import AbsFormulaBase from './base';

abstract class AbsFormulaOperator extends AbsFormulaBase implements IFormulaOperator {

  public tokenIndex: number;

  public priority: number;

  public operatorType: FormulaOperatorType;

  constructor(origText: string, tokenIndex: number, options: FormulaValueOptions, operatorType: FormulaOperatorType, priority: number) {
    super(origText, options);
    this.tokenIndex = tokenIndex;
    this.name = origText;
    this.operatorType = operatorType;
    this.priority = priority;
  }

}

export default AbsFormulaOperator;
