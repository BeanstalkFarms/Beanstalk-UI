import { useSelector } from 'react-redux';
import { AppState } from 'state';

const useFarmerBalances = () => useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);

export default useFarmerBalances;
