import FormulaFunctionFinancial, { annuityTerms } from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionPV extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    const { value: pmt, balance: fv, timing, annuity, growth } = annuityTerms(args, context, 'pmt', 'fv', true);
    return pmt.mul(timing).mul(annuity).add(fv).neg()
      .div(growth);
  }

}

export default FormulaFunctionPV;

