import { SeasonalPriceDocument, useFarmerSiloAssetSnapshotsQuery, useFarmerSiloRewardsQuery } from '~/generated/graphql';
import useSeasonsQuery, { SeasonRange } from '~/hooks/beanstalk/useSeasonsQuery';
import useInterpolateDepositsByAssetType from '~/hooks/farmer/useInterpolateDepositsByAssetType';

// TODO: Duplicate code useFarmerSiloOverview
// Why? here, depositData is type DataPoint2[][]
// and in useFarmerSiloOverview depositData is
// type DataPoint[][]
const useFarmerBalancesOverview = (account: string | undefined) => {
  const siloRewardsQuery = useFarmerSiloRewardsQuery({ variables: { account: account || '' }, skip: !account, fetchPolicy: 'cache-and-network' });
  const siloAssetsQuery = useFarmerSiloAssetSnapshotsQuery({ variables: { account: account || '' }, skip: !account, fetchPolicy: 'cache-and-network' });
  const priceQuery = useSeasonsQuery(SeasonalPriceDocument, SeasonRange.ALL);

  const depositData = useInterpolateDepositsByAssetType(siloAssetsQuery, priceQuery);

  return {
    data: {
      deposits: depositData,
    },
    loading: (
      siloRewardsQuery.loading
      || siloAssetsQuery.loading 
      || priceQuery.loading
      // || breakdown hasn't loaded value yet
    )
  };
};

export default useFarmerBalancesOverview;
