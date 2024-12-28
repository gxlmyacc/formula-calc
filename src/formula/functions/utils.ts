import { resolveValue } from '../base/value';
import { FormulaValues } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import { nextWithPrimise, flatten } from '../utils';

type WalkEvent<T> = ((itemValue: T|T[], index: number, isArray: boolean, isFirst: boolean) => void)

function walkValues<T = any>(
  params: FormulaValues,
  dataSource: IFormulaDataSource,
  options: FormulaValueOptions,
  onWalk: WalkEvent<T>,
  forArithmetic?: boolean
) {
  return nextWithPrimise(
    params.map(v => v.execute(dataSource, options, forArithmetic)),
    (params) => {
      let result;
      let isFirst = true;
      for (let i = 0; i < params.length; i++) {
        const itemValue = params[i];
        if (Array.isArray(itemValue)) {
          const values = flatten(itemValue).map(v => resolveValue(v, options));
          result = onWalk(values as any, i, true, isFirst);
        } else {
          result = onWalk(itemValue, i, false, isFirst);
        }
        isFirst = false;
      }
      return result;
    },
    false
  );
}

export {
  walkValues
};

