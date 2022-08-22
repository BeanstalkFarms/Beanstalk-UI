import isEmpty from 'lodash/isEmpty';
import useFarmerBalances from './farmer/useFarmerBalances';

/**
 * Ensure we've loaded a Farmer's balances.
 */
export default function useFarmerReady() {
  const balances = useFarmerBalances();
  return !isEmpty(balances);
}
