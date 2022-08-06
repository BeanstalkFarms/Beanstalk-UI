import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalDepositedUnripeBeansDocument, SeasonalDepositedUnripeBeansQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/useSeasons';
import { toTokenUnitsBN } from '../../../util';
import { BEAN } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalDepositedUnripeBeansQuery>) => toTokenUnitsBN(season.hourlyDepositedAmount, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
    title: 'Deposited Unripe Beans',
    gap: 0.5,
};

const DepositedUnripeBeans: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalDepositedUnripeBeansQuery>
    height={height}
    document={SeasonalDepositedUnripeBeansDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    />
);

export default DepositedUnripeBeans;
