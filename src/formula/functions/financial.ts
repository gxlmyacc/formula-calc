import Decimal from 'decimal.js';
import AbsFormulaFunction from '../base/function';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import { isDecimalValue, nextWithPromise } from '../utils';

export type FinancialContext = {
  D: typeof Decimal;
  rate: Decimal;
  base: Decimal;
  number(value: unknown, label: string): Decimal;
  fail(message: string): never;
};

/** Shared execution plumbing; each financial function owns its calculation in a separate class. */
abstract class FormulaFunctionFinancial extends AbsFormulaFunction {

  public arithmetic = true;

  public mayChange = true;

  protected abstract calculate(args: any[], context: FinancialContext): Decimal;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(this.params.map((param) => param.execute(dataSource, options, true)), (args) => {
      const BaseDecimal = options.Decimal || Decimal;
      // Guard digits reduce cancellation for small rates without changing the caller's Decimal configuration.
      const D = BaseDecimal.clone({ precision: Math.max(40, BaseDecimal.precision) });
      const fail = (message: string): never => {
        throw new Error(`[${this.name}] ${message}`);
      };
      const number = (value: unknown, label: string): Decimal => {
        if (options.nullAsZero && (value == null || value === ''
          || (typeof value === 'number' && isNaN(value)) || (BaseDecimal.isDecimal(value) && (value as Decimal).isNaN()))) {
          return new D(0);
        }
        if (!isDecimalValue(value, options)) {
          return fail(`${label} must be a finite number`);
        }
        const numeric = new D(value as Decimal.Value);
        if (!numeric.isFinite()) {
          return fail(`${label} must be a finite number`);
        }
        return numeric;
      };
      const rate = number(args[0], 'rate');
      if (rate.lte(-1)) {
        return fail('rate must be greater than -1');
      }
      D.set({ precision: Math.max(D.precision, Math.min(1000, 20 + rate.decimalPlaces())) });
      return this.calculate(args, { D, rate, base: rate.add(1), number, fail });
    }, false);
    return nextWithPromise(result, (value: Decimal) => {
      if (!value.isFinite()) {
        throw new Error(`[${this.name}] result is not finite`);
      }
      return value;
    });
  }

}

export function paymentTiming(args: any[], context: FinancialContext) {
  const type = context.number(args.length > 4 ? args[4] : 0, 'type');
  if (!type.eq(0) && !type.eq(1)) {
    return context.fail('type must be 0 or 1');
  }
  return { type, timing: context.rate.mul(type).add(1) };
}

/** Terms of the shared equation: pv * growth + pmt * timing * annuity + fv = 0. */
export function annuityTerms(args: any[], context: FinancialContext, valueName: string, balanceName: string, allowZero: boolean) {
  const nper = context.number(args[1], 'nper');
  if (nper.lt(0)) {
    return context.fail('nper must be non-negative');
  }
  if (nper.isZero() && !allowZero) {
    return context.fail('nper must be positive');
  }
  const value = context.number(args[2], valueName);
  const balance = context.number(args.length > 3 ? args[3] : 0, balanceName);
  const { type, timing } = paymentTiming(args, context);
  const growth = context.base.pow(nper);
  const annuity = context.rate.isZero() ? nper : growth.sub(1).div(context.rate);
  return { nper, value, balance, type, timing, growth, annuity };
}

export function fixedPayment(terms: ReturnType<typeof annuityTerms>, context: FinancialContext) {
  if (terms.annuity.isZero()) {
    return context.fail('payment cannot be determined');
  }
  return terms.value.mul(terms.growth).add(terms.balance).neg().div(terms.timing.mul(terms.annuity));
}

/** Use the unrounded payment to split principal and interest, including advance payments. */
export function paymentParts(args: any[], context: FinancialContext) {
  const terms = annuityTerms([args[0], ...args.slice(2)], context, 'pv', 'fv', false);
  const payment = fixedPayment(terms, context);
  const per = context.number(args[1], 'per');
  if (!per.isInteger() || per.lt(1) || per.gt(terms.nper)) {
    return context.fail('per must be an integer between 1 and nper');
  }
  let interest = new context.D(0);
  if (!context.rate.isZero() && !(terms.type.eq(1) && per.eq(1))) {
    const previousGrowth = context.base.pow(per.sub(1));
    const previousAnnuity = previousGrowth.sub(1).div(context.rate);
    interest = terms.value.mul(previousGrowth).add(payment.mul(terms.timing).mul(previousAnnuity)).mul(context.rate).neg();
    if (terms.type.eq(1)) {
      interest = interest.div(context.base);
    }
  }
  return { payment, interest };
}

export default FormulaFunctionFinancial;
