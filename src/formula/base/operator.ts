import type { FormulaValueOptions, IFormulaOperator } from '../type';
import { FormulaOperatorType } from '../type';
import AbsFormulaBase from './base';

const paramsCountMap = {
  [FormulaOperatorType.fotBinary]: 2,
  [FormulaOperatorType.fotUnaryLeft]: 1,
  [FormulaOperatorType.fotUnaryRight]: 1,
  [FormulaOperatorType.fotTernary]: 3,
};

abstract class AbsFormulaOperator extends AbsFormulaBase implements IFormulaOperator {

  public tokenIndex: number;

  public priority: number;

  public operatorType: FormulaOperatorType;

  public paramsCount: number|null;

  constructor(origText: string, tokenIndex: number, options: FormulaValueOptions, operatorType: FormulaOperatorType, priority: number) {
    super(origText, options);
    this.tokenIndex = tokenIndex;
    this.name = origText;
    this.operatorType = operatorType;
    this.priority = priority;
    this.paramsCount = (paramsCountMap as any)[operatorType] || null;
  }

}

export default AbsFormulaOperator;
