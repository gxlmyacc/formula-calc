import { FormulaValues } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
declare function walkValues(params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions, onWalk: (itemValue: any, index: number, isArray: boolean) => void): void | Promise<void>;
export { walkValues };
