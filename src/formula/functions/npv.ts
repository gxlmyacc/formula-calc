import type Decimal from 'decimal.js';
import FormulaFunctionFinancial from './financial';
import type { FinancialContext } from './financial';

class FormulaFunctionNPV extends FormulaFunctionFinancial {

  protected calculate(args: any[], context: FinancialContext) {
    const values = args[1];
    if (!Array.isArray(values) || !values.length) {
      return context.fail('values must be a non-empty array');
    }
    let discount = new context.D(1);
    return values.reduce((total: Decimal, value: unknown, index: number) => {
      discount = discount.mul(context.base);
      return total.add(context.number(value, `values[${index}]`).div(discount));
    }, new context.D(0));
  }

}

export default FormulaFunctionNPV;
