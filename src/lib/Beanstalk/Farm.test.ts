// import BigNumber from 'bignumber.js';

import { ethers } from 'ethers';
import Farm from './Farm';

describe('utilities', () => {
  describe('slippage', () => {
    const oneBean    = ethers.BigNumber.from(1_000_000); // 1 BEAN
    const billyBeans = ethers.BigNumber.from(1_000_000_000_000_000); // 1,000,000,000 BEAN
    it('returns input for zero slippage', () => {
      const out = Farm.slip(oneBean, 0);
      expect(out.toString()).toEqual('1000000');
    });
    it('calculates a standard 0.1% slippage on 1 BEAN', () => {
      const out = Farm.slip(oneBean, 0.001); // 0.1%
      expect(out.toString()).toEqual('999000'); // 0.999 BEAN
    });
    it('calculates a standard 0.1% slippage on 1 BEAN', () => {
      const out = Farm.slip(oneBean, 0.001); // 0.1%
      expect(out.toString()).toEqual('999000'); // 0.999 BEAN
    });
    it('calculates a standard 0.1% slippage on 1,000,000,000 BEAN', () => {
      const out = Farm.slip(billyBeans, 0.001); // 0.1%
      expect(out.toString()).toEqual('999000000000000'); // 999,000,000 BEAN
    });
    /// FIXME: test cases for very small inputs
  });
  describe('direction', () => {
    it('orders forward', () => {
      expect(Farm.direction(1, 2, true)).toEqual([1, 2]);
    });
    it('orders backward', () => {
      expect(Farm.direction(1, 2, false)).toEqual([2, 1]);
    });
  });
});
