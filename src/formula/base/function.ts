import type { IFormulaValue, FormulaValueOptions, IFormulaFunction, Token } from '../type';
import { TokenType } from '../type';
import AbsFormulaBase from './base';


abstract class AbsFormulaFunction extends AbsFormulaBase implements IFormulaFunction {

  public _origText: string;

  public argMin: number;

  public argMax: number;

  public tokenType: TokenType = TokenType.ttFunc;

  public owner: IFormulaValue | null = null;

  public get origText() {
    return this._origText;
  }

  public set origText(value: string) {
    this._origText = value;
  }

  constructor(token: Token, options: FormulaValueOptions, name: string, argMin: number, argMax: number) {
    super(token, options);
    this._origText = token.token;
    this.name = name;
    this.argMin = argMin;
    this.argMax = argMax;
  }

  checkArgValid() {
    const paramsLen = this.params.length;
    return paramsLen >= this.argMin && paramsLen <= this.argMax
      ? ''
      : `"${this.name}" invalid param count, expected: ${
        this.argMin === this.argMax ? this.argMin : `${this.argMin} to ${this.argMax}`
      }, actual: ${paramsLen}`;
  }

}

type FormulaFunctionItem = {
  min: number
  max: number;
  functionClass: typeof AbsFormulaFunction;
}

export {
  FormulaFunctionItem
};

export default AbsFormulaFunction;
