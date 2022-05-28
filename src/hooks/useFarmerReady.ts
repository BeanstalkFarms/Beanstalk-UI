import isEmpty from 'lodash/isEmpty';
import useFarmerBalances from './useFarmerBalances';

export default function useFarmerReady() {
  const balances = useFarmerBalances();
  return !isEmpty(balances);
}
