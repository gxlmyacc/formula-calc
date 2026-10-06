import { getFunctions } from './model';
import { translate } from './i18n';
import type { Locale } from './i18n';

export type ApiTab = 'operators' | 'functions';
export type ApiEntry = { name: string; signature: string; category: string; description: string };

const OPERATORS = [
  ['+', 'a + b', '算术', '加法'],
  ['-', 'a - b', '算术', '减法；支持负数字面值'],
  ['*', 'a * b', '算术', '乘法'],
  ['/', 'a / b', '算术', '除法'],
  ['//', 'a // b', '算术', '整除，截去商的小数部分'],
  ['%', 'a % b', '算术', '取余，与百分比后缀不同'],
  ['^', 'a ^ b', '算术', '幂运算'],
  ['百分比 %', 'value%', '算术', '百分比：2.01% 等于 0.0201'],
  ['>', 'a > b', '比较', '大于'],
  ['>=', 'a >= b', '比较', '大于等于'],
  ['<', 'a < b', '比较', '小于'],
  ['<=', 'a <= b', '比较', '小于等于'],
  ['= / ==', 'a == b', '比较', '相等；按库的数值处理及字符串比较规则判断'],
  ['!= / <>', 'a != b', '比较', '不相等'],
  ['& / &&', 'a && b', '逻辑与条件', '逻辑与，左侧为假时短路并返回左侧值'],
  ['| / ||', 'a || b', '逻辑与条件', '逻辑或，左侧为真时短路并返回左侧值'],
  ['!', '!value', '逻辑与条件', '逻辑非'],
  ['? :', 'condition ? then : else', '逻辑与条件', '条件为真返回 then，否则返回 else；只计算选中的分支'],
  ['( )', '(expression)', '分组与引用', '括号分组，改变计算顺序；普通括号可以被 $n 引用'],
  ['$n', '$1, $2, …', '分组与引用', '引用第 n 个普通括号的结果，编号从左到右；函数括号不编号'],
] as const;

const CATEGORIES: Record<string, string[]> = {
  金融计算: ['fv', 'pv', 'pmt', 'nper', 'ipmt', 'ppmt', 'npv'],
  聚合: ['sum', 'avg', 'min', 'max'],
  取整与范围: ['round', 'ceil', 'floor', 'trunc', 'clamp', 'abs', 'sign'],
  幂与对数: ['sqrt', 'cbrt', 'hypot', 'ln', 'log', 'log10', 'log2'],
  三角与双曲函数: ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'],
  条件与数据: ['if', 'exist', 'eval', 'noref', 'random'],
  类型与字符串: ['number', 'string', 'boolean', 'concat'],
};

export function getApiEntries(tab: ApiTab, locale: Locale): ApiEntry[] {
  return tab === 'operators'
    ? OPERATORS.map(([name, signature, category, description]) => ({
      name: name === '百分比 %' ? `${translate(locale, '百分比')} %` : name,
      signature,
      category: translate(locale, category),
      description: translate(locale, description),
    }))
    : getFunctions(locale).map((entry) => ({
      name: entry.name,
      signature: `${entry.name}(${entry.args.join(', ')})`,
      category: translate(locale, Object.keys(CATEGORIES).find((category) => CATEGORIES[category].includes(entry.name)) || '自定义函数'),
      description: entry.description,
    }));
}

export function searchApi(entries: ApiEntry[], query: string): ApiEntry[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => terms.every((term) =>
    `${entry.name} ${entry.signature} ${entry.category} ${entry.description}`.toLowerCase().includes(term)));
}
