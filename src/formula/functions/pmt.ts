import FormulaFunctionFinancial, { annuityTerms, fixedPayment } from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionPMT extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    return fixedPayment(annuityTerms(args, context, 'pv', 'fv', false), context);
  }

}

export default FormulaFunctionPMT;

