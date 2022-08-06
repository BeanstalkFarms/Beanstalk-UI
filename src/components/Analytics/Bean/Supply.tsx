import React from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalSupplyQuery, SeasonalSupplyDocument } from '~/generated/graphql';
import { BEAN } from '~/constants/tokens';
import { toTokenUnitsBN } from '~/util';
import { SnapshotData } from '~/hooks/useSeasonsQuery';

const getValue = (season: SnapshotData<SeasonalSupplyQuery>) => toTokenUnitsBN(season.beans, BEAN[1].decimals).toNumber();
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
