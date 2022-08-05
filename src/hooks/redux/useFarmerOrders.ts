import { useSelector } from 'react-redux';
import { AppState } from 'state';

const useFarmerOrders = () => useSelector<AppState, AppState['_farmer']['market']['orders']>(
  (state) => state._farmer.market.orders,
);

export default useFarmerOrders;
