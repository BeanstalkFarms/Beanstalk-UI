import { useSelector } from 'react-redux';
import { AppState } from 'state';

const usePodRate = () => {
  const { podLine } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const { supply: totalBeanSupply } = useSelector<AppState, AppState['_bean']['token']>((state) => state._bean.token);
  return podLine.dividedBy(totalBeanSupply).multipliedBy(100);
};

export default usePodRate;
