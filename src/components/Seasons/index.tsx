import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

import sunriseIcon from 'img/black-sun.svg';
import { sunrise, chainId } from 'util/index';
import {
  ContentDropdown,
  ContentSection,
  Grid,
  HeaderLabelList,
  pegStrings,
  seasonStrings,
  SingleButton,
} from 'components/Common';
import { makeStyles } from '@mui/styles';
import PegMaintenance from './PegMaintenance';
import SeasonReward from './SeasonReward';
import SeasonTimer from './SeasonTimer';
import NarrowContainer from 'components/Common/Container/NarrowContainer';

const useStyles = makeStyles({
  advanceButtonGrid: {
    maxWidth: '300px',
    padding: '0px'
  },
  pegMaintenanceGrid: {
    // padding: '0px',
    // marginTop: '12px'
  }
});

export default function Seasons() {
  const classes = useStyles();
  const { season, period, start } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const nextSeasonTime = start.plus(season.plus(1).multipliedBy(period));
  const timeUntilSunrise = (deadline: string) =>
    parseInt(deadline, 10) - Date.now() / 1e3;

  const timer = useRef();
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
  const advanceButton = (time <= 0 && chainId === 3) ? (
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
    <div>
      <Grid container justifyContent="center">
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
        {advanceButton}
        <PegMaintenance />
      </Grid>
      <NarrowContainer>
        <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
          <ContentDropdown
            description={pegStrings.pegDescription}
            descriptionTitle="What is Peg Maintenance?"
          />
        </Grid>
      </NarrowContainer>
    </div>
  );
}
