import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions, IFormulaBase, Token } from '../type';
import { FormulaValues } from '../type';
import FormulaValue from './value';

abstract class AbsFormulaBase extends FormulaValue implements IFormulaValue, IFormulaBase {

  public params: FormulaValues;

  constructor(token: Token, options: FormulaValueOptions) {
    super(token, options);
    this.params = [];
  }

  protected checkArgValid() {
    return '';
  }

  public execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean): any {
    const error = this.checkArgValid();
    if (error) {
      throw new Error(`[${this.name}]${error}`);
    }
    return super.execute(dataSource, options, forArithmetic);
  }

}

export default AbsFormulaBase;
