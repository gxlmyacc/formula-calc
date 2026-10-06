import FormulaFunctionFinancial, { paymentParts } from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionIPMT extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    return paymentParts(args, context).interest;
  }

}

export default FormulaFunctionIPMT;

