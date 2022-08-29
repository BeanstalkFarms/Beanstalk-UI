import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalSeedsDocument, SeasonalSeedsQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/beanstalk/useSeasonsQuery';
import { toTokenUnitsBN } from '~/util';
import { SEEDS } from '~/constants/tokens';

const getValue = (season: SnapshotData<SeasonalSeedsQuery>) => toTokenUnitsBN(season.totalSeeds, SEEDS.decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Seeds',
  titleTooltip: 'The total number of Seeds.',
  gap: 0.5,
};
const queryConfig = {
  variables: {
    season_gt: 6073,
  }
};

const Seeds: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalSeedsQuery>
    height={height}
    document={SeasonalSeedsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    queryConfig={queryConfig}
  />
);

export default Seeds;
