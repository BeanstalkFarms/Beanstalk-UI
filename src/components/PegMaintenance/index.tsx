import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/material';
import BigNumber from 'bignumber.js';

import { AppState } from 'state';
import { sunrise, chainId } from 'util/index';
import {
  ContentDropdown,
  Grid,
  HeaderLabelList,
  pegStrings,
  seasonStrings,
  SingleButton,
} from 'components/Common';
import sunriseIcon from 'img/black-sun.svg';

import Seasons from './Seasons';
import SeasonReward from './SeasonReward';
import SeasonTimer from './SeasonTimer';

const useStyles = makeStyles({
  advanceButtonGrid: {
    maxWidth: '300px',
    padding: '0px'
  },
});

export default function PegMaintenance() {
  const classes = useStyles();
  const { season, period, start } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const nextSeasonTime = start.plus(season.plus(1).multipliedBy(period));
  const timeUntilSunrise = (deadline: BigNumber) =>
    parseInt(deadline.toString(), 10) - Date.now() / 1e3;

  const timer = useRef<any>();
  const [time, setTime] = useState(timeUntilSunrise(nextSeasonTime));

  // 
  useEffect(() => {
    timer.current = window.setInterval(() => {
      setTime(timeUntilSunrise(nextSeasonTime));
    }, 1000);
    return () => {
      window.clearInterval(timer.current);
    };
  }, [time, nextSeasonTime]);

  // On Ropsten, add a button to advance the season.
  const sunriseButton = (time <= 0 && chainId === 3) ? (
    <Grid
      item
      md={5}
      sm={6}
      xs={12}
      className={classes.advanceButtonGrid}
    >
      <SingleButton
        description={seasonStrings.advance}
        handleClick={() => {
          sunrise();
        }}
        icon={sunriseIcon}
        margin="-13px 7px 0 0"
        size="small"
        title="Sunrise"
      />
    </Grid>
  ) : null;

  const [stTitle, stValue, stDescription, stBalanceDescription] =
    SeasonTimer(time);

  const [srTitle, srValue, srDescription, srBalanceDescription] =
    SeasonReward(time);

  return (
    <Grid container justifyContent="center" rowSpacing={2}>
      {/* Description */}
      <Grid item xs={12}>
        <Container maxWidth="xs">
          <ContentDropdown
            description={pegStrings.pegDescription}
            descriptionTitle="What is Peg Maintenance?"
          />
        </Container>
      </Grid>
      {/* Quick Stats */}
      <Grid item xs={12}>
        <HeaderLabelList
          description={[
            seasonStrings.season,
            stDescription,
            srDescription,
          ]}
          balanceDescription={[
            `${season.isNegative() ? '---' : String(season)}`,
            stBalanceDescription,
            srBalanceDescription,
          ]}
          title={[
            'Current Season',
            stTitle,
            srTitle,
          ]}
          value={[
            `${season.isNegative() ? '---' : String(season)}`,
            stValue,
            srValue,
          ]}
          width="300px"
        />
      </Grid>
      {/* Sunrise Button */}
      {sunriseButton}
      {/* Seasons Card */}
      <Grid item xs={12}>
        <Seasons />
      </Grid>
    </Grid>
  );
}
