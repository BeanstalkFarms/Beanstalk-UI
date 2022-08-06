import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from '~/components/Common/Charts/SeasonPlot';
import { SeasonalSownDocument, SeasonalSownQuery } from '~/generated/graphql';
import useSeason from '~/hooks/useSeason';
import { SnapshotData } from '~/hooks/useSeasons';
import { toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';

const getValue = (season: SnapshotData<SeasonalSownQuery>) => toTokenUnitsBN(season.sownBeans, BEAN[1].decimals).toNumber();
const formatValue = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const StatProps = {
  title: 'Sown',
  gap: 0.25,
  sx: { ml: 0 }
};

const Sown: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => {
  const season  = useSeason();
  return (
    <SeasonPlot<SeasonalSownQuery>
      height={height}
      document={SeasonalSownDocument}
      // defaultValue={podRate?.gt(0) ? podRate.div(100).toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default Sown;
