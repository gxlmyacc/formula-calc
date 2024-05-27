import type { IFormulaValue, FormulaValueOptions, IFormulaFunction } from '../type';
import { TokenType } from '../type';
import AbsFormulaBase from './base';
declare abstract class AbsFormulaFunction extends AbsFormulaBase implements IFormulaFunction {
    argMin: number;
    argMax: number;
    tokenType: TokenType;
    owner: IFormulaValue | null;
    constructor(origText: string, options: FormulaValueOptions, name: string, argMin: number, argMax: number);
    checkArgVaild(): string;
}
type FormulaFunctionItem = {
    min: number;
    max: number;
    functionClass: typeof AbsFormulaFunction;
};
export { FormulaFunctionItem };
export default AbsFormulaFunction;
