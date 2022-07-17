import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from '../state';
import { useHumidityFromId } from './useHumidity';

export default function useFarmerTotalFertilizer(tokenIds?: string[]) {
  const farmerFertilizer = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer);
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
          unfertilized: new BigNumber(0),
          fertilizer:   new BigNumber(0),
        }
      ),
    [farmerFertilizer, getHumidity, ids]
  );
}
