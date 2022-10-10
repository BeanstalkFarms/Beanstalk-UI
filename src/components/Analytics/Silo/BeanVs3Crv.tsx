import React, { useMemo } from 'react';
import { Card } from '@mui/material';
import BigNumber from 'bignumber.js';
import useSeasonsQuery, {
  SnapshotData,
} from '~/hooks/beanstalk/useSeasonsQuery';
import { BEANSTALK_ADDRESSES } from '~/constants';
import { BEAN, BEAN_CRV3_LP } from '~/constants/tokens';
import {
  SeasonalDepositedSiloAssetDocument,
  SeasonalDepositedSiloAssetQuery,
} from '~/generated/graphql';
import { toTokenUnitsBN } from '~/util';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import { ERC20Token } from '~/classes/Token';
import { BaseDataPoint } from '~/components/Common/Charts/ChartPropProvider';
import BaseSeasonPlot from '~/components/Common/Charts/BaseSeasonPlot';

const assets = {
  bean: BEAN[1],
  bean3Crv: BEAN_CRV3_LP[1],
};

const account = BEANSTALK_ADDRESSES[1];

const queryConfig = {
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
};

const formatValue = (value: number) =>
  `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const getStatValue = <T extends BaseDataPoint>(v?: T[]) => {
  if (!v?.length) return 0;
  const value = v[0];
  if (value?.bean && value?.bean3Crv) {
    const bean3CrvBeanVal = new BigNumber(value.bean3Crv).times(2);
    return bean3CrvBeanVal.plus(value.bean).toNumber();
  }
  return 0;
};

const getValue = (asset: ERC20Token) => {
  const fn = (season: SnapshotData<SeasonalDepositedSiloAssetQuery>) =>
    toTokenUnitsBN(season.totalDepositedAmount, asset.decimals).toNumber();
  return fn;
};

const BeanVs3Crv: React.FC<{}> = () => {
  const timeTabParams = useTimeTabState();
  const beanQuery = useSeasonsQuery<SeasonalDepositedSiloAssetQuery>(
    SeasonalDepositedSiloAssetDocument,
    timeTabParams[0][1],
    queryConfig.bean
  );
  const bean3CrvQuery = useSeasonsQuery<SeasonalDepositedSiloAssetQuery>(
    SeasonalDepositedSiloAssetDocument,
    timeTabParams[0][1],
    queryConfig.bean3Crv
  );

  const queryParams = useMemo(
    () => [
      { query: beanQuery, getValue: getValue(assets.bean), key: 'bean' },
      {
        query: bean3CrvQuery,
        getValue: getValue(assets.bean3Crv),
        key: 'bean3Crv',
      },
    ],
    [bean3CrvQuery, beanQuery]
  );

  return (
    <Card sx={{ pt: 2 }}>
      <BaseSeasonPlot
        queryData={queryParams}
        height={300}
        StatProps={{
          title: 'Total Deposited Bean & Bean3Crv',
          gap: 0.5,
        }}
        timeTabParams={timeTabParams}
        formatValue={formatValue}
        stackedArea
        ChartProps={{
          getDisplayValue: getStatValue,
          tooltip: true,
        }}
      />
    </Card>
  );
};

export default BeanVs3Crv;
