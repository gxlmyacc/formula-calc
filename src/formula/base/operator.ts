import type { FormulaValueOptions, IFormulaOperator, Token } from '../type';
import { FormulaOperatorType, OperatorWithLeftParams } from '../type';
import AbsFormulaBase from './base';

const paramsCountMap = {
  [FormulaOperatorType.fotBinary]: 2,
  [FormulaOperatorType.fotUnaryLeft]: 1,
  [FormulaOperatorType.fotUnaryRight]: 1,
  [FormulaOperatorType.fotTernary]: 3,
};

abstract class AbsFormulaOperator extends AbsFormulaBase implements IFormulaOperator {

  public priority: number;

  public operatorType: FormulaOperatorType;

  public paramsCount: number|null;

  public get column() {
    return OperatorWithLeftParams.includes(this.operatorType)
      ? this.params[0].column
      : super.column;
  }

  public get line() {
    return OperatorWithLeftParams.includes(this.operatorType)
      ? this.params[0].line
      : super.line;
  }

  constructor(token: Token, options: FormulaValueOptions, operatorType: FormulaOperatorType, priority: number) {
    super(token, options);
    this.name = token.token;
    this.operatorType = operatorType;
    this.priority = priority;
    this.paramsCount = (paramsCountMap as any)[operatorType] || null;
  }

}

export default AbsFormulaOperator;
