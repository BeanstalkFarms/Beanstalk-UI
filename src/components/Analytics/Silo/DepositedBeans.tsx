import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalDepositedBeansDocument, SeasonalDepositedBeansQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';
import { toTokenUnitsBN } from '../../../util';
import { BEAN } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalDepositedBeansQuery>) => toTokenUnitsBN(season.totalDepositedAmount, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Deposited Beans',
  titleTooltip: 'The total number of Deposited Beans.',
  gap: 0.5,
};
const queryConfig = {
  variables: {
    season_gt: 6073,
  }
};

const DepositedBeans: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalDepositedBeansQuery>
    height={height}
    document={SeasonalDepositedBeansDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    queryConfig={queryConfig}
  />
);

export default DepositedBeans;
