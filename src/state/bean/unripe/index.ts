import BigNumber from 'bignumber.js';
import { AddressMap } from '~/constants';

export type Unripe = {
  chopRates: AddressMap<BigNumber>;
}
