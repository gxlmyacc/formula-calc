import { AbsFormulaFunction } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
declare class FormulaFunctionAVERAGE extends AbsFormulaFunction {
    checkArgVaild(): string;
    _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): number;
}
export default FormulaFunctionAVERAGE;
