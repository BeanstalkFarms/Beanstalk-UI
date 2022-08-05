import React from 'react';
import SeasonPlot, {
    SeasonPlotBaseProps,
} from 'components/Common/Charts/SeasonPlot';
import { SeasonalSupplyQuery, SeasonalSupplyDocument } from 'generated/graphql';
import { SnapshotData } from 'hooks/useSeason';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BEAN } from '../../../constants/tokens';
import { toTokenUnitsBN } from '../../../util';

const getValue = (season: SnapshotData<SeasonalSupplyQuery>) => toTokenUnitsBN(season.totalPods, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const useStatProps = () => {
    const theme = useTheme();
    const isTiny = useMediaQuery(theme.breakpoints.down('md'));
    return {
        title: isTiny ? 'Supply' : 'Bean Supply',
        gap: 0.25,
        color: 'primary',
        sx: { ml: 0 },
    };
};
const LineChartProps = {
    isTWAP: true,
};

const Supply: React.FC<{ height?: SeasonPlotBaseProps['height'] }> = ({
    height,
}) => {
    const StatProps = useStatProps();
    return (
      <SeasonPlot<SeasonalSupplyQuery>
        height={height}
        document={SeasonalSupplyDocument}
        getValue={getValue}
        formatValue={formatValue}
        StatProps={StatProps}
        />
    );
};

export default Supply;
