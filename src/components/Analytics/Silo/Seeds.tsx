import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalSeedsDocument, SeasonalSeedsQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/useSeasonsQuery';
import { toTokenUnitsBN } from '../../../util';
import { SEEDS } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalSeedsQuery>) => toTokenUnitsBN(season.hourlySeedsDelta, SEEDS.decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
    title: 'Seed Changes',
    gap: 0.5,
};

const Seeds: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalSeedsQuery>
    height={height}
    document={SeasonalSeedsDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    />
);

export default Seeds;
