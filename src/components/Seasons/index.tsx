import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import sunriseIcon from '../../img/black-sun.svg';
import { sunrise, chainId } from '../../util';

import { ContentSection, Grid, HeaderLabel, SingleButton } from '../Common';
import PegMaintenance from './PegMaintenance';
import SeasonReward from './SeasonReward';
import SeasonTimer from './SeasonTimer';

export default function Seasons() {
  const { season, period, start } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const nextSeasonTime = start.plus(season.plus(1).multipliedBy(period));
  const timeUntilSunrise = (deadline) =>
    parseInt(deadline, 10) - Date.now() / 1e3;

  const timer = useRef();
  const [time, setTime] = useState(timeUntilSunrise(nextSeasonTime));

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setTime(timeUntilSunrise(nextSeasonTime));
    }, 1000);
    return () => {
      window.clearInterval(timer.current);
    };
  }, [time, nextSeasonTime]);

  const advanceButton =
    time <= 0 && chainId === 3 ? (
      <SingleButton
        description="Advance the Season by calling the Sunrise function"
        handleClick={() => {
          sunrise();
        }}
        icon={sunriseIcon}
        margin="-13px 7px 0 0"
        size="small"
        title="Sunrise"
      />
    ) : null;

  const sunriseStats =
    time <= 0 ? (
      <Grid
        item
        md={5}
        sm={6}
        xs={12}
        style={{ maxWidth: '300px', padding: '12px' }}
      >
        <SeasonReward time={time} />
      </Grid>
    ) : null;

  return (
    <ContentSection
      id="seasons"
      title="Seasons"
      size="20px"
    >
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid
          item
          md={5}
          sm={6}
          xs={12}
          style={{ maxWidth: '300px', padding: '12px' }}
        >
          <HeaderLabel
            description="Seasons are the timekeeping mechanism of Beanstalk. Every Season is approximately 1 hour.
            Each Season begins when the Sunrise function is called on the Ethereum blockchain.
            The Sunrise function can be called by anyone at the top of each hour."
            title="Current Season"
            value={season.isNegative() ? '---' : String(season)}
          />
        </Grid>
        <Grid
          item
          md={5}
          sm={6}
          xs={12}
          style={{ maxWidth: '300px', padding: '12px' }}
        >
          <SeasonTimer time={time} />
        </Grid>
        {sunriseStats}
      </Grid>
      <Grid
        item
        md={5}
        sm={6}
        xs={12}
        style={{ maxWidth: '300px', padding: '12px' }}
      >
        {advanceButton}
      </Grid>

      <Grid
        container
        item
        xs={12}
        style={{ padding: '0px', marginTop: '12px' }}
        justifyContent="center"
      >
        <PegMaintenance />
      </Grid>
    </ContentSection>
  );
}
