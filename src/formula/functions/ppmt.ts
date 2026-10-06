import FormulaFunctionFinancial, { paymentParts } from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionPPMT extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    const { payment, interest } = paymentParts(args, context);
    return payment.sub(interest);
  }

}

export default FormulaFunctionPPMT;

