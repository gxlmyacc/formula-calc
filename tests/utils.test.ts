import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import { toRound, getValueByPath } from '../src';

describe('utils test', () => {
  test('utils', () => {
    expect(toRound(3.335)).toBe(3.34);
    expect(toRound(3.331, 2, Decimal.ROUND_CEIL)).toBe(3.34);

    expect(toRound(3.331, 2, Decimal.ROUND_CEIL)).toBe(3.34);

    expect(getValueByPath({
      a: {
        b: 1
      }
    }, 'a.b')).toBe(1);
    expect(getValueByPath({
      a: {
        b: [{ c: 1 }]
      }
    }, 'a.b.0.c')).toBe(1);
  });
});

