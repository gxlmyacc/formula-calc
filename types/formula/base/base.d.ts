import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions, IFormulaBase } from '../type';
import { FormulaValues } from '../type';
import FormulaValue from './value';
declare abstract class AbsFormulaBase extends FormulaValue implements IFormulaValue, IFormulaBase {
    name: string;
    params: FormulaValues;
    constructor(origText: string, options: FormulaValueOptions);
    protected checkArgVaild(): string;
    execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any;
}
export default AbsFormulaBase;
