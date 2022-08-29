import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalDepositedBean3CrvDocument, SeasonalDepositedBean3CrvQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';
import { toTokenUnitsBN } from '~/util';
import { BEAN_CRV3_LP } from '~/constants/tokens';

const getValue = (season: SnapshotData<SeasonalDepositedBean3CrvQuery>) => toTokenUnitsBN(season.totalDepositedAmount, BEAN_CRV3_LP[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Deposited BEAN:3CRV',
  titleTooltip: 'The total number of Deposited BEAN:3CRV LP Tokens.',
  gap: 0.5,
};
const queryConfig = {
  variables: {
    season_gt: 6073,
  }
};

const DepositedBean3CRV: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalDepositedBean3CrvQuery>
    height={height}
    document={SeasonalDepositedBean3CrvDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    queryConfig={queryConfig}
  />
);

export default DepositedBean3CRV;
