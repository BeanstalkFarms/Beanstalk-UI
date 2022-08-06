import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalDepositedBeansDocument, SeasonalDepositedBeansQuery } from '~/generated/graphql';
import { SnapshotData } from '~/hooks/useSeasons';
import { toTokenUnitsBN } from '../../../util';
import { BEAN } from '../../../constants/tokens';

const getValue = (season: SnapshotData<SeasonalDepositedBeansQuery>) => toTokenUnitsBN(season.hourlyDepositedAmount, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
    title: 'Deposited Beans',
    gap: 0.5,
};

const DepositedBeans: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({ height }) => (
  <SeasonPlot<SeasonalDepositedBeansQuery>
    height={height}
    document={SeasonalDepositedBeansDocument}
    getValue={getValue}
    formatValue={formatValue}
    StatProps={StatProps}
    />
);

export default DepositedBeans;
