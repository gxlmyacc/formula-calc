import { describe, expect } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    const executed: Array<[string, any]> = [];
    const str1 = `张
三`;
    const expression = `true ? "${str1}"
: "李四"`;
    const result = formulaCalc(
      expression,
      {
        onTrace(item, value) {
          executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
        }
      }
    );
    expect(result).toBe(str1);
    expect(executed).toEqual([
      ['[1, 1]: true', true],
      [`[1, 8]: "${str1}"`, str1],
      [`[1, 1]: true ? "${str1}" : "李四"`, str1]
    ]);
  });
});

