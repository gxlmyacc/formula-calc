
import type { IFormulaDataSource, FormulaValueOptions, FormulaCustomFunctionItem } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

class FormulaFunctionCUSTOM extends AbsFormulaFunction {

  public item: FormulaCustomFunctionItem;

  constructor(origText: string, options: FormulaValueOptions, name: string, item: FormulaCustomFunctionItem) {
    super(origText, options, name, item.argMin, item.argMax);
    this.item = item;
  }

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    if (this.item.preExecute === false) {
      return this.item.execute(this.params, dataSource, options);
    }
    return nextWithPrimise(
      this.params.map(v => v.execute(dataSource, options)),
      params => this.item.execute(params, dataSource, options),
      false,
    );
  }

}

export default FormulaFunctionCUSTOM;
