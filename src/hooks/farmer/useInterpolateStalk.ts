import { useMemo } from 'react';
import { useFarmerSiloRewardsQuery } from '~/generated/graphql';
import useSeason from '~/hooks/beanstalk/useSeason';
import { interpolateFarmerStalk } from '~/util/Interpolate';

const useInterpolateStalk = (
  siloRewardsQuery: ReturnType<typeof useFarmerSiloRewardsQuery>
) => {
  const season = useSeason();
  return useMemo(() => {
    if (!season.gt(0) || !siloRewardsQuery.data?.snapshots?.length) return [[], []];
    const snapshots = siloRewardsQuery.data.snapshots;
    return interpolateFarmerStalk(snapshots, season);
  }, [siloRewardsQuery.data?.snapshots, season]);
};

export default useInterpolateStalk;
