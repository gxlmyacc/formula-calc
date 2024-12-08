import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions, IFormulaBase } from '../type';
import { FormulaValues } from '../type';
import FormulaValue from './value';

abstract class AbsFormulaBase extends FormulaValue implements IFormulaValue, IFormulaBase {

  public name: string = '';

  public params: FormulaValues;

  constructor(origText: string,  options: FormulaValueOptions) {
    super(origText, options);
    this.params = [];
  }


  protected checkArgVaild(): string {
    return '';
  }

  public execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean): any {
    const error = this.checkArgVaild();
    if (error) {
      throw new Error(`[${this.name}]${error}`);
    }
    return super.execute(dataSource, options, forArithmetic);
  }

}

export default AbsFormulaBase;
