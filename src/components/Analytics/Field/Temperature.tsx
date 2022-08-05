import React from 'react';
import SeasonPlot, { SeasonPlotBaseProps } from 'components/Common/Charts/SeasonPlot';
import { SeasonalWeatherDocument, SeasonalWeatherQuery } from 'generated/graphql';
import useSeason from '~/hooks/useSeason';
import { useSelector } from 'react-redux';
import { SnapshotData } from '~/hooks/useSeasons';
import { AppState } from '~/state';

const getValue = (snapshot: SnapshotData<SeasonalWeatherQuery>) => snapshot.weather;
const formatValue = (value: number) => `${value.toFixed(0)}%`;
const StatProps = {
  title: 'Temperature',
  gap: 0.5,
};

const Temperature: React.FC<{height?: SeasonPlotBaseProps['height']}> = ({ height }) => {
  const temperature = useSelector<AppState, AppState['_beanstalk']['field']['weather']['yield']>((state) => state._beanstalk.field.weather.yield);
  const season  = useSeason();
  return (
    <SeasonPlot<SeasonalWeatherQuery>
      height={height}
      document={SeasonalWeatherDocument}
      defaultValue={temperature?.gt(0) ? temperature.toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default Temperature;
