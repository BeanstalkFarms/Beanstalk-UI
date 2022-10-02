import React, { useMemo } from 'react';
import { Card } from '@mui/material';
import useSeasonsQuery, {
  SnapshotData,
} from '~/hooks/beanstalk/useSeasonsQuery';
import { BEANSTALK_ADDRESSES } from '~/constants';
import {
  BEAN,
  BEAN_CRV3_LP,
} from '~/constants/tokens';
import {
  SeasonalDepositedSiloAssetDocument,
  SeasonalDepositedSiloAssetQuery,
} from '~/generated/graphql';
import { toTokenUnitsBN } from '~/util';
import useTimeTabState from '~/hooks/app/useTimeTabState';
import SeasonPlotMulti from '~/components/Common/Charts/SeasonPlotMulti';
import { ERC20Token } from '~/classes/Token';
import { ChartMultiStyles } from '~/components/Common/Charts/MultiStackedAreaChart';
import { BeanstalkPalette } from '~/components/App/muiTheme';

const assets = {
  bean: BEAN[1],
  bean3Crv: BEAN_CRV3_LP[1],
};
const account = BEANSTALK_ADDRESSES[1];

const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const stylesConfig: ChartMultiStyles = {
  bean: { stroke: BeanstalkPalette.lightGreen, fillPrimary: BeanstalkPalette.mediumGreen },
  bean3Crv: { stroke: BeanstalkPalette.lightBlue, fillPrimary: BeanstalkPalette.skyBlue }
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
      bean: { variables: { season_gt: 6073, siloAsset: `${account.toLowerCase()}-${assets.bean.address}` } },
      bean3Crv: { variables: { season_gt: 6073, siloAsset: `${account.toLowerCase()}-${assets.bean3Crv.address}` } },
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

  const queryParams = useMemo(() => [
      { query: beanQuery, getValue: getValue(assets.bean), key: 'bean' },
      { query: bean3CrvQuery, getValue: getValue(assets.bean3Crv), key: 'bean3Crv' }
    ],
   [bean3CrvQuery, beanQuery]);

  const statProps = useMemo(() => ({
    title: 'Total Deposited Bean & Bean3Crv',
    gap: 0.5
  }), []);

  return (
    <Card sx={{ pt: 2 }}>
      <SeasonPlotMulti
        queryData={queryParams}
        height={300}
        StatProps={statProps}
        timeTabParams={timeTabParams}
        formatStat={formatValue}
        stackedArea
        ChartProps={{
          stylesConfig: stylesConfig
        }}
      />
    </Card>
  );
};

export default BeanVs3Crv;
