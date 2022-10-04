import React, { useMemo } from 'react';
import { Card } from '@mui/material';
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
import SeasonPlotMulti from '~/components/Common/Charts/SeasonPlotMulti';
import { ERC20Token } from '~/classes/Token';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import {
  BaseDataPoint,
  ChartMultiStyles,
} from '~/components/Common/Charts/ChartPropProvider';

const assets = {
  bean: BEAN[1],
  bean3Crv: BEAN_CRV3_LP[1],
};
const account = BEANSTALK_ADDRESSES[1];

const stylesConfig: ChartMultiStyles = {
  bean: {
    stroke: BeanstalkPalette.logoGreen,
    fillPrimary: BeanstalkPalette.lightGreen,
  },
  bean3Crv: {
    stroke: BeanstalkPalette.darkBlue,
    fillPrimary: BeanstalkPalette.lightBlue,
  },
};

const formatValue = (value: number) =>
  `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const getStatValue = <T extends BaseDataPoint>(v?: T | T[]) => {
  if (!v) return 0;
  if (Array.isArray(v)) {
    return (
      v.reduce((acc, curr) => {
        acc += curr.value;
        return acc;
      }, 0) / 2
    );
  }
  if (v?.bean && v?.bean3Crv) {
    return v.bean3Crv / v.bean;
  }
  return 0;
};

const getValue = (asset: ERC20Token) => {
  const fn = (season: SnapshotData<SeasonalDepositedSiloAssetQuery>) =>
    toTokenUnitsBN(season.totalDepositedAmount, asset.decimals).toNumber();
  return fn;
};

const BeanVs3Crv: React.FC<{}> = () => {
  // refactor me
  const timeTabParams = useTimeTabState();
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

  const statProps = useMemo(
    () => ({
      title: 'Total Deposited Bean & Bean3Crv',
      gap: 0.5,
    }),
    []
  );

  return (
    <Card sx={{ pt: 2 }}>
      <SeasonPlotMulti
        queryData={queryParams}
        height={300}
        StatProps={statProps}
        timeTabParams={timeTabParams}
        getStatValue={getStatValue}
        formatValue={formatValue}
        stackedArea
        ChartProps={{
          stylesConfig: stylesConfig,
          tooltip: true,
        }}
      />
    </Card>
  );
};

export default BeanVs3Crv;
