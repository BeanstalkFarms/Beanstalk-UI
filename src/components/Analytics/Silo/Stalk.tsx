import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalStalkDocument, SeasonalStalkQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/useSeasonsQuery';
import { toTokenUnitsBN } from '../../../util';
import { STALK } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalStalkQuery>) => toTokenUnitsBN(season.totalStalk, STALK.decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Total Stalk',
  gap: 0.5,
};

const Stalk: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalStalkQuery>
    height={height}
    document={SeasonalStalkDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
  />
);

export default Stalk;
