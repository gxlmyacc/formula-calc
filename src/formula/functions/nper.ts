import type Decimal from 'decimal.js';
import FormulaFunctionFinancial, { paymentTiming } from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionNPER extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    const { rate, base, number, fail } = context;
    const pmt = number(args[1], 'pmt');
    const pv = number(args[2], 'pv');
    const fv = number(args.length > 3 ? args[3] : 0, 'fv');
    const { timing } = paymentTiming(args, context);
    let periods: Decimal;
    if (rate.isZero()) {
      if (pmt.isZero()) {
        return fail('nper cannot be determined with zero rate and zero payment');
      }
      periods = pv.add(fv).neg().div(pmt);
    } else {
      const adjustedPayment = pmt.mul(timing);
      const denominator = pv.mul(rate).add(adjustedPayment);
      const numerator = adjustedPayment.sub(fv.mul(rate));
      if (denominator.isZero() || numerator.isZero()) {
        return fail('no finite non-negative nper exists');
      }
      const ratio = numerator.div(denominator);
      if (ratio.lte(0)) {
        return fail('no finite non-negative nper exists');
      }
      periods = ratio.ln().div(base.ln());
    }
    if (!periods.isFinite() || periods.lt(0)) {
      return fail('no finite non-negative nper exists');
    }
    return periods;
  }

}

export default FormulaFunctionNPER;
