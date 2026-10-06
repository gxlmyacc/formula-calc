import FormulaFunctionFinancial, { annuityTerms } from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionFV extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    const { value: pmt, balance: pv, timing, annuity, growth } = annuityTerms(args, context, 'pmt', 'pv', true);
    return pmt.mul(timing).mul(annuity).add(pv.mul(growth)).neg();
  }

}

export default FormulaFunctionFV;

