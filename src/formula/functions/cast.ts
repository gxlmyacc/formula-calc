import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

const CAST_MAP = {
  string: String,
  number: Number,
  boolean: Boolean,
};

class FormulaFunctionCAST extends AbsFormulaFunction {

  constructor(origText: string,  options: FormulaValueOptions, name: string, argMin: number, argMax: number) {
    super(origText, options, name, argMin, argMax);
    this.arithmetic = name === 'number';
  }

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      this.params.map(param => param.execute(dataSource, options, this.arithmetic)),
      value => {
        const cast = (CAST_MAP as any)[this.name];
        if (value === undefined && cast === String) {
          return 'null';
        }
        return cast(value);
      },
    );
    return result;
  }

}

export {
  CAST_MAP
};

export default FormulaFunctionCAST;
