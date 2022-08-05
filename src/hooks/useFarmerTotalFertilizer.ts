import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ZERO_BN } from '~/constants';
import { AppState } from '../state';
import { useHumidityFromId } from './useHumidity';

export default function useFarmerTotalFertilizer(tokenIds?: string[]) {
  const farmerFertilizer = useSelector<AppState, AppState['_farmer']['barn']>((state) => state._farmer.barn);
  const getHumidity = useHumidityFromId();
  const ids = tokenIds === undefined ? Object.keys(farmerFertilizer.fertilizer) : tokenIds;

  return useMemo(
    () =>
      ids.reduce(
        (agg, thisId) => {
          const [humidity] = getHumidity();
          const amount = farmerFertilizer.fertilizer[thisId];
          agg.unfertilized = agg.unfertilized.plus(
            amount.multipliedBy(humidity.plus(1))
          );
          return agg;
        },
        {
          unfertilized: ZERO_BN,
          fertilizer:   ZERO_BN,
        }
      ),
    [farmerFertilizer, getHumidity, ids]
  );
}
