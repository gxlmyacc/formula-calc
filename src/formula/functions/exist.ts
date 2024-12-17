
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { getValueByPath, isDecimal, isString, isValueType, nextWithPrimise } from '../utils';


class FormulaFunctionEXIST extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0].execute(dataSource, options),
        this.params[1].execute(dataSource, options),
        this.params[2]?.execute(dataSource, options),
      ],
      (model: any, key: string, type?: any) => {
        if (!isString(key)) {
          throw new Error('Invalid parameter type: "key" is not string!');
        }
        let ret = true;
        let value = key
          ? getValueByPath(model, key, () => {
            ret = false;
          })
          : model;
        if (ret && type && isString(type)) {
          if (isDecimal(value, options)) {
            value = value.toNumber();
          }
          ret = isValueType(value, type as any);
        }
        return ret;
      }
    );
    return result;
  }

}

export default FormulaFunctionEXIST;
