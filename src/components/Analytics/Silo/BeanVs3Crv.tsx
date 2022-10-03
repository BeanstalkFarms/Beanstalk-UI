import React, { useMemo } from 'react';
import { Card, Stack, Typography } from '@mui/material';
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
import { ChartMultiStyles } from '~/components/Common/Charts/MultiStackedAreaChart';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { BaseDataPoint } from '~/components/Common/Charts/ChartPropProvider';
import Row from '~/components/Common/Row';

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

const updateDisplayValue = <T extends BaseDataPoint>(v?: T | T[]) => {
  if (!v) return 0;
  if (Array.isArray(v)) return 0;
  if (v?.bean && v?.bean3Crv) {
    return parseFloat(formatValue(v.bean3Crv / v.bean));
  }
  return 0;
};
const TooltipComponent = <T extends BaseDataPoint>({ d }: { d: T }) => (
  <Stack gap={0.5} width="200px">
    <Row justifyContent="space-between">
      <Typography>Bean</Typography>
      <Typography textAlign="right">{formatValue(d?.bean)}</Typography>
    </Row>
    <Row justifyContent="space-between">
      <Typography>Bean3Crv</Typography>
      <Typography textAlign="right">{formatValue(d?.bean3Crv)}</Typography>
    </Row>
  </Stack>
);

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
        // formatStat={formatValue}
        getStatValue={updateDisplayValue}
        updateDisplayValue={updateDisplayValue}
        stackedArea
        ChartProps={{
          stylesConfig: stylesConfig,
          tooltipComponent: TooltipComponent,
        }}
      />
    </Card>
  );
};

export default BeanVs3Crv;
