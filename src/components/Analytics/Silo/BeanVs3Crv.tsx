import React, { useMemo, useState } from 'react';
import { Card, Stack } from '@mui/material';
import useSeasonsQuery, {
  SeasonAggregation,
  SeasonRange,
  SnapshotData,
} from '~/hooks/beanstalk/useSeasonsQuery';
import { BEANSTALK_ADDRESSES } from '~/constants';
import { BEAN, BEAN_CRV3_LP } from '~/constants/tokens';
import {
  SeasonalDepositedSiloAssetDocument,
  SeasonalDepositedSiloAssetQuery,
} from '~/generated/graphql';
import { TimeTabState } from '~/components/Common/Charts/TimeTabs';
import { useMergeSeasonsQueries } from '~/hooks/beanstalk/useMergeSeasonsQueries';

const assets = {
  bean: BEAN[1],
  bean3Crv: BEAN_CRV3_LP[1],
};

const account = BEANSTALK_ADDRESSES[1];

const getValue = (s: SnapshotData<SeasonalDepositedSiloAssetQuery>) => s.totalDepositedAmount;

const BeanVs3Crv: React.FC<{}> = () => {
  // refactor me
  const [tabState, setTimeTab] = useState<TimeTabState>([
    SeasonAggregation.HOUR,
    SeasonRange.WEEK,
  ]);
  const queryConfig = useMemo(() => ({
    bean: { 
      variables: {
        season_gt: 6073,
        siloAsset: `${account.toLowerCase()}-${assets.bean.address}`,
      } 
    },
    bean3Crv: { 
      variables: {
        season_gt: 6073,
        siloAsset: `${account.toLowerCase()}-${assets.bean3Crv.address}`,
      } 
    }
  }),[]);
  const beanQuery = useSeasonsQuery<SeasonalDepositedSiloAssetQuery>(
    SeasonalDepositedSiloAssetDocument,
    tabState[1],
    queryConfig.bean
  );
  const bean3CrvQuery = useSeasonsQuery<SeasonalDepositedSiloAssetQuery>(
    SeasonalDepositedSiloAssetDocument,
    tabState[1],
    queryConfig.bean3Crv
  );

  const params = useMemo(() => [
      { query: beanQuery, getValue }, 
      { query: bean3CrvQuery, getValue }
    ], [bean3CrvQuery, beanQuery]);

  const { data, error, loading } = useMergeSeasonsQueries(params);

  console.log('rerender...');

  return (
    <Card>
      <Stack>Text graph</Stack>
    </Card>
  );
};

export default BeanVs3Crv;

// const getBeanValue = useCallback(
//   (season: SnapshotData<SeasonalDepositedSiloAssetQuery>) =>
//     toTokenUnitsBN(
//       season.totalDepositedAmount,
//       assets.bean.decimals
//     ).toNumber(),
//   []
// );

/// Display values
// const [displayValue, setDisplayValue] = useState<number | undefined>(
//   undefined
// );
// const [displaySeason, setDisplaySeason] = useState<number | undefined>(
//   undefined
// );

/// Handlers
// const handleChangeTimeTab = useCallback((tabs: TimeTabState) => {
//   setTimeTab(tabs);
// }, []);
// const handleCursor = useCallback((dps?: SeasonDataPoint[]) => {
//   setDisplaySeason(dps ? dps[0].season : undefined);
//   setDisplayValue(dps ? dps[0].value : undefined);
// }, []);
