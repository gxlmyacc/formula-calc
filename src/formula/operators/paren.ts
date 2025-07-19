
import { TokenType, Token } from '../type';
import type { IFormulaDataSource, FormulaValueOptions, FormulaOperatorType  } from '../type';
import AbsFormulaOperator from '../base/operator';
import { nextWithPromise } from '../utils';

class FormulaOperatorPAREN extends AbsFormulaOperator {

  public _origText: string;

  public tokenType: TokenType = TokenType.ttParenL;

  public closed: boolean = false;

  public get origText() {
    return this._origText;
  }

  public set origText(value: string) {
    this._origText = value;
  }

  constructor(token: Token, options: FormulaValueOptions, operatorType: FormulaOperatorType, priority: number) {
    super(token, options, operatorType, priority);
    this._origText = token.token;
  }

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    const result = nextWithPromise(
      this.params.map((v) => v.execute(dataSource, options, forArithmetic)),
      (params) => params,
      false
    );
    return result.length <= 1 ? result[0] : result;
  }

}

export default FormulaOperatorPAREN;
