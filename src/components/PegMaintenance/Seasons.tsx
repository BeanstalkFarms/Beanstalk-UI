import React from 'react';
import BigNumber from 'bignumber.js';
import { Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BEAN,
  DELTA_POD_DEMAND_LOWER_BOUND,
  DELTA_POD_DEMAND_UPPER_BOUND,
  MAX_UINT32,
  OPTIMAL_POD_RATE,
  PEG_WEATHER_CASES,
  POD_RATE_LOWER_BOUND,
  POD_RATE_UPPER_BOUND,
} from 'constants/index';
import { displayBN, displayFullBN, TrimBN } from 'util/index';
import {
  DataBalanceModule,
  Grid,
  Line,
  pegStrings,
} from 'components/Common';
import { makeStyles } from '@mui/styles';
import MultiCard from 'components/Common/Cards/MultiCard';

const useStyles = makeStyles({
  spanStyle: {
    display: 'inline-block',
    fontFamily: 'Futura-Pt-Book',
    fontWeight: 'bold',
    marginTop: '0px',
    padding: '0 10px',
    textAlign: 'left',
    width: '100%',
  }
});

const StatBalance : React.FC<{ sm: number }> = (props) => (
  <Grid item sm={props.sm} xs={12}>
    <DataBalanceModule
      {...props}
      direction="column"
    />
  </Grid>
);

type Stat = {
  title?: string;
  balance?: any;
  description?: string;
  balanceDescription?: string;
  placement?: string;
}

type StatsProps = {
  title: string;
  columns: Stat[];
}

const Stats : React.FC<StatsProps> = (props) => {
  const classes = useStyles();
  return (
    <MultiCard type="foreground">
      <Grid container justifyContent="center">
        <span className={classes.spanStyle}>
          {props.title}
          <Line />
        </span>
        {props.columns.map((col: Stat, index: number) => (
          <StatBalance
            key={index}
            sm={12 / props.columns.length}
            {...col}
          />
        ))}
      </Grid>
    </MultiCard>
  );
};

export default function PegMaintenance() {
  const { beanTWAPPrice, usdcTWAPPrice, beanReserve, ethReserve } = useSelector<
    AppState,
    AppState['prices']
  >((state) => state.prices);

  const { totalPods, totalBeans, totalLP, totalSiloLP, totalTransitLP } = useSelector<
    AppState,
    AppState['totalBalance']
  >((state) => state.totalBalance);

  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );

  const {
    startSoil,
    soil,
    lastDSoil,
    lastSowTime,
    didSowBelowMin,
    didSowFaster,
    weather,
    raining,
    rainStart,
  } = useSelector<AppState, AppState['weather']>((state) => state.weather);

  const price = beanTWAPPrice.dividedBy(usdcTWAPPrice);
  const podRate = totalPods.dividedBy(totalBeans).multipliedBy(100);
  const deltaSoil = startSoil.minus(soil);
  const deltaDemand = !deltaSoil.isEqualTo(0)
    ? !lastDSoil.isEqualTo(0)
      ? deltaSoil.dividedBy(lastDSoil)
      : new BigNumber(100000)
    : new BigNumber(0);

  let caseId = 0;
  if (podRate.isGreaterThanOrEqualTo(POD_RATE_UPPER_BOUND)) caseId = 24;
  else if (podRate.isGreaterThanOrEqualTo(OPTIMAL_POD_RATE)) caseId = 16;
  else if (podRate.isGreaterThanOrEqualTo(POD_RATE_LOWER_BOUND)) caseId = 8;

  if (
    price.isGreaterThan(1) ||
    (price.isEqualTo(1) && podRate.isLessThanOrEqualTo(OPTIMAL_POD_RATE))
  ) {
    caseId += 4;
  }

  if (deltaDemand.isGreaterThanOrEqualTo(DELTA_POD_DEMAND_UPPER_BOUND)) {
    caseId += 2;
  } else if (deltaDemand.isGreaterThanOrEqualTo(DELTA_POD_DEMAND_LOWER_BOUND)) {
    if (lastSowTime.isEqualTo(MAX_UINT32) || !didSowBelowMin) caseId += 1;
    else if (didSowFaster) caseId += 2;
  }

  let deltaWeather = new BigNumber(PEG_WEATHER_CASES[caseId]);
  if (weather.plus(deltaWeather).isLessThanOrEqualTo(0)) {
    deltaWeather = weather.minus(1);
  }

  const currentBeans = beanReserve
    .multipliedBy(ethReserve)
    .dividedBy(beanTWAPPrice)
    .sqrt();
  const targetBeans = beanReserve
    .multipliedBy(ethReserve)
    .dividedBy(usdcTWAPPrice)
    .sqrt();

  let newBeans = new BigNumber(0);
  let newSoil = new BigNumber(0);

  if (currentBeans.isLessThan(targetBeans)) {
    newBeans = targetBeans.minus(currentBeans);
    newBeans = newBeans.multipliedBy(totalSiloLP.plus(totalTransitLP)).dividedBy(totalLP);
    newSoil = newBeans.dividedBy(weather.dividedBy(50).plus(2));
  } else {
    newSoil = currentBeans.minus(targetBeans);
    newSoil = newSoil.multipliedBy(totalSiloLP.plus(totalTransitLP)).dividedBy(totalLP);
  }

  newSoil = newSoil.minus(soil);

  newBeans = TrimBN(newBeans, BEAN.decimals);
  newSoil = TrimBN(newSoil, BEAN.decimals, true);

  // Rain Forecast
  const rainingSeasons = season.minus(rainStart);
  const rainNextSeason = caseId > 3 && caseId < 8;
  let rainForecast;
  if (raining && rainNextSeason) rainForecast = 'More Showers';
  else if (rainNextSeason) rainForecast = 'Start';
  else if (raining) rainForecast = 'Stop';
  else rainForecast = 'Sun';

  const nextSeasonStats = {
    title: 'Next Season',
    columns: [
      {
        title: 'New Beans',
        balance: displayBN(newBeans),
        description: pegStrings.newBeans,
        balanceDescription:
          newBeans.isGreaterThan(0) ? `${displayFullBN(newBeans)} Beans` : undefined,
        placement: 'bottom',
      },
      {
        title: 'New Soil',
        balance: displayBN(newSoil, true),
        description: pegStrings.newSoil,
        balanceDescription:
          newSoil.isEqualTo(0) ? undefined : `${displayFullBN(newSoil)} Soil`,
        placement: 'bottom',
      },
      {
        title: 'Weather Forecast',
        balance: `${weather.plus(deltaWeather)}%`,
        description: pegStrings.weather,
        balanceDescription:
          deltaWeather !== 0
            ? `${weather.plus(deltaWeather).toString()}% Weather`
            : undefined,
        placement: 'bottom',
      },
      {
        title: 'Rain Forecast',
        balance: rainForecast,
        description: pegStrings.rainForecast,
      }
    ]
  };

  const currentSeasonStats = {
    title: 'Current Season',
    columns: [
      {
        title: 'Price',
        balance: `$${price.toFixed(4)}`,
        description: pegStrings.price,
        balanceDescription: `$${displayFullBN(price)} Price`,
        placement: 'bottom',
      },
      {
        title: 'Pod Rate',
        balance: `${displayBN(podRate)}%`,
        description: pegStrings.podRate,
        balanceDescription: podRate.isGreaterThan(0)
          ? `${displayFullBN(podRate)}% Pod Rate`
          : undefined,
        placement: 'bottom',
      },
      {
        title: 'Delta Demand',
        balance:
          lastDSoil.isEqualTo(0) && deltaSoil.isGreaterThan(0) ? (
            <span>
              <span style={{ fontSize: '19px' }}>&#8734;</span>%
            </span>
          ) : (
            `${deltaDemand.multipliedBy(100).toFixed(2)}%`
          ),
        description: pegStrings.deltaDemand,
        balanceDescription:
          lastDSoil.isEqualTo(0) || deltaSoil.isGreaterThan(0)
            ? undefined
            : `${displayBN(deltaDemand)}% Change in Demand`,
        placement: 'bottom',
      },
    ]
  };
  
  if (raining) {
    currentSeasonStats.columns.push({
      title: 'Seasons of Rain',
      balance: displayBN(rainingSeasons.plus(1)),
      balanceDescription: '',
      description: pegStrings.rain,
      placement: 'bottom'
    });
  }

  return (
    <Container maxWidth="md">
      <MultiCard type="input">
        <Stack spacing={2}>
          <Stats {...nextSeasonStats} />
          <Stats {...currentSeasonStats} />
        </Stack>
      </MultiCard>
    </Container>
  );
}

/* <Grid
  container
  item
  xs={12}
  spacing={3}
  alignItems="center"
  justifyContent="center"
  style={{ maxWidth: '1145px' }}
>
  <Grid item md={8} sm={12} xs={12}>
    <Box className="AppBar-shadow" style={pegMaintenanceStyle}>
      <span className={classes.pegMaintenanceSpanStyle}>
        Peg Maintenance
        <QuestionModule
          description={pegStrings.pegTableDescription}
          margin="-6px 0 0 2px"
        />
      </span>
      <Line style={lineStyle} />
    </Box>
  </Grid>
</Grid> */
