import React, { useMemo } from 'react';
import { Card } from '@mui/material';
import useSeasonsQuery, {
  SnapshotData,
} from '~/hooks/beanstalk/useSeasonsQuery';
import { BEANSTALK_ADDRESSES } from '~/constants';
import { BEAN, BEAN_CRV3_LP, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import {
  SeasonalDepositedSiloAssetDocument,
  SeasonalDepositedSiloAssetQuery,
} from '~/generated/graphql';
import { useMergeSeasonsQueries } from '~/hooks/beanstalk/useMergeSeasonsQueries';
import { toTokenUnitsBN } from '~/util';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import SeasonPlotMulti from '~/components/Common/Charts/SeasonPlotMulti';
import { ERC20Token } from '~/classes/Token';

const assets = {
  bean: BEAN[1],
  bean3Crv: BEAN_CRV3_LP[1],
  urBean: UNRIPE_BEAN[1],
  urBean3Crv: UNRIPE_BEAN_CRV3[1],
};
const account = BEANSTALK_ADDRESSES[1];

const getValue = (asset: ERC20Token) => {
  const fn = (season: SnapshotData<SeasonalDepositedSiloAssetQuery>) =>
    toTokenUnitsBN(season.totalDepositedAmount, asset.decimals).toNumber();
  return fn;
};

const BeanVs3Crv: React.FC<{}> = () => {
  // refactor me
  const timeTabState = useTimeTabState();

  const queryConfig = useMemo(
    () => ({
      bean: {
        variables: {
          season_gt: 6073,
          siloAsset: `${account.toLowerCase()}-${assets.bean.address}`,
        },
      },
      bean3Crv: {
        variables: {
          season_gt: 6073,
          siloAsset: `${account.toLowerCase()}-${assets.bean3Crv.address}`,
        },
      },
    }),
    []
  );
  const beanQuery = useSeasonsQuery<SeasonalDepositedSiloAssetQuery>(
    SeasonalDepositedSiloAssetDocument,
    timeTabState[0][1],
    queryConfig.bean
  );
  const bean3CrvQuery = useSeasonsQuery<SeasonalDepositedSiloAssetQuery>(
    SeasonalDepositedSiloAssetDocument,
    timeTabState[0][1],
    queryConfig.bean3Crv
  );

  const mergeProps = useMergeSeasonsQueries([
    { query: beanQuery, getValue: getValue(assets.bean), key: 'bean' },
    {
      query: bean3CrvQuery,
      getValue: getValue(assets.bean3Crv),
      key: 'bean3Crv',
    },
  ]);

  return (
    <Card>
      <SeasonPlotMulti
        {...mergeProps}
        // StatProps={{
        //   title: 'Deposited Bean vs Bean3Crv',
        // }}
        // formatStat={(value: number) => value.toString()}
        timeTabState={timeTabState}
      />
    </Card>
  );
};

export default BeanVs3Crv;
