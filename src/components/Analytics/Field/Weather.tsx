import React from 'react';
import SeasonPlot from 'components/Common/Charts/SeasonPlot';
import { SeasonalWeatherDocument, SeasonalWeatherQuery } from 'generated/graphql';
import useSeason from 'hooks/useSeason';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { SnapshotData } from 'hooks/useSeasons';

const getValue = (snapshot: SnapshotData<SeasonalWeatherQuery>) => snapshot.weather;
const formatValue = (value: number) => `${value.toFixed(0)}%`;
const StatProps = {
  title: 'Weather',
  gap: 0.5,
};

const Weather: React.FC = () => {
  const weather = useSelector<AppState, AppState['_beanstalk']['field']['weather']['yield']>((state) => state._beanstalk.field.weather.yield);
  const season  = useSeason();
  return (
    <SeasonPlot<SeasonalWeatherQuery>
      document={SeasonalWeatherDocument}
      defaultValue={weather?.gt(0) ? weather.toNumber() : 0}
      defaultSeason={season?.gt(0) ? season.toNumber() : 0}
      getValue={getValue}
      formatValue={formatValue}
      StatProps={StatProps}
    />
  );
};

export default Weather;
