
import type { IFormulaDataSource, FormulaValueOptions, FormulaCustomFunctionItem } from '../type';
import AbsFormulaFunction from '../base/function';
import { isDecimal, nextWithPrimise } from '../utils';

class FormulaFunctionCUSTOM extends AbsFormulaFunction {

  public item: FormulaCustomFunctionItem;

  constructor(origText: string, options: FormulaValueOptions, name: string, item: FormulaCustomFunctionItem) {
    super(origText, options, name, item.argMin, item.argMax);
    this.item = item;
    this.arithmetic = item.arithmetic ?? Boolean(item.arithmetic);
  }

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    if (this.item.preExecute === false) {
      return this.item.execute(this.params, dataSource, options);
    }
    return nextWithPrimise(
      this.params.map(v => {
        let result = v.execute(dataSource, options);
        if (isDecimal(result, options)) {
          result = result.toNumber();
        }
        return result;
      }),
      params => this.item.execute(params, dataSource, options, forArithmetic),
      false,
    );
  }

}

export default FormulaFunctionCUSTOM;
