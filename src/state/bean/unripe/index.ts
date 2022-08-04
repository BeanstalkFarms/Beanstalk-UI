import BigNumber from 'bignumber.js';
import { AddressMap } from 'constants/index';

export type Unripe = {
  chopRates: AddressMap<BigNumber>;
}
