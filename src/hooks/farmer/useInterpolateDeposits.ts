import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFarmerSiloAssetSnapshotsQuery, useSeasonalPriceQuery } from '~/generated/graphql';
import { AppState } from '~/state';
import { interpolateFarmerAssetBalances, interpolateFarmerDepositedValue, Snapshot } from '~/util/Interpolate';

const useInterpolateDeposits = (
  siloAssetsQuery: ReturnType<typeof useFarmerSiloAssetSnapshotsQuery>,
  priceQuery: ReturnType<typeof useSeasonalPriceQuery>,
  /** Show balance for each deposited asset instead of total deposited value. */
  byAssetType?: boolean
) => {
  const unripe = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);
  return useMemo(() => {
    if (
      priceQuery.loading
      || !priceQuery.data?.seasons?.length
      || !siloAssetsQuery.data?.farmer?.silo?.assets.length
      || Object.keys(unripe).length === 0
    ) {
      return [];
    }

    // Convert the list of assets => snapshots into one snapshot list
    // sorted by season and normalized based on chop rate.
    const snapshots = siloAssetsQuery.data.farmer.silo.assets.reduce((prev, curr) => {
      const tokenAddress = curr.token.toLowerCase();
      prev.push(
        ...curr.hourlySnapshots.map((snapshot) => ({
          ...snapshot,
          hourlyDepositedBDV: (
            // NOTE: this isn't really true since it uses the *instantaneous* chop rate,
            // and the BDV of an unripe token isn't necessarily equal to this. but this matches
            // up with what the silo table below the overview shows.
            unripe[tokenAddress]
              ? new BigNumber(snapshot.hourlyDepositedAmount).times(unripe[tokenAddress].chopRate)
              : snapshot.hourlyDepositedBDV
          )
        }))
      );
      return prev;
    }, [] as Snapshot[]).sort((a, b) => a.season - b.season);

    if (byAssetType) {
      return interpolateFarmerAssetBalances(snapshots, priceQuery.data.seasons);
    }

    return interpolateFarmerDepositedValue(snapshots, priceQuery.data.seasons);
  }, [
    byAssetType,
    unripe,
    priceQuery.loading,
    priceQuery.data,
    siloAssetsQuery.data,
  ]);
};

export default useInterpolateDeposits;
