import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalDepositedUnripeBean3CrvDocument, SeasonalDepositedUnripeBean3CrvQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/useSeasonsQuery';
import { toTokenUnitsBN } from '../../../util';
import { BEAN } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalDepositedUnripeBean3CrvQuery>) => toTokenUnitsBN(season.hourlyDepositedAmount, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
    title: 'Deposited Unripe BEAN:3CRV',
    gap: 0.5,
};

const DepositedUnripeBean3CRV: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalDepositedUnripeBean3CrvQuery>
    height={height}
    document={SeasonalDepositedUnripeBean3CrvDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    />
);

export default DepositedUnripeBean3CRV;
