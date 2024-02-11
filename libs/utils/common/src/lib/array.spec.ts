import { arrayFromNumber } from './array';

describe('Array', () => {
  it('arrayFromNumber', () => {
    expect(arrayFromNumber(5)).toEqual([0, 1, 2, 3, 4]);
  });
});
