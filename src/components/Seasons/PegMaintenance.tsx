import React from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BEAN,
  DELTA_POD_DEMAND_LOWER_BOUND,
  DELTA_POD_DEMAND_UPPER_BOUND,
  STEADY_SOW_TIME,
  MAX_UINT32,
  OPTIMAL_POD_RATE,
  PEG_WEATHER_CASES,
  POD_RATE_LOWER_BOUND,
  POD_RATE_UPPER_BOUND,
  theme,
} from 'constants/index';
import { displayBN, displayFullBN, TrimBN } from 'util/index';
import {
  DataBalanceModule,
  Grid,
  Line,
  pegStrings,
  QuestionModule,
} from 'components/Common';

const gridStyle = {
  backgroundColor: theme.module.foreground,
  borderRadius: '25px',
  marginBottom: '12px',
  padding: '10px 10px 4px 10px',
};
const spanStyle = {
  display: 'inline-block',
  fontFamily: 'Futura-Pt-Book',
  fontWeight: 'bold',
  marginTop: '0px',
  padding: '0 10px',
  textAlign: 'left',
  width: '100%',
};
const lineStyle = {
  margin: '10px 8px',
};
const pegMaintenanceStyle = {
  borderRadius: '25px',
  color: theme.text,
  backgroundColor: theme.module.background,
  padding: '10px',
  fontFamily: 'Futura-Pt-Book',
  marginTop: '24px',
};
const pegMaintenanceSpanStyle = {
  width: '100%',
  display: 'inline-block',
  textAlign: 'center',
  marginTop: '5px',
  fontFamily: 'Futura-Pt-Book',
  fontSize: '20px',
};

const bottomGridStyle = { ...gridStyle };
bottomGridStyle.marginBottom = null;

function StatBalance(props) {
  return (
    <Grid item sm={props.gridWidth !== undefined ? props.gridWidth : 4} xs={12}>
      <DataBalanceModule questionMargin="-8px 0 0 2px" {...props} />
    </Grid>
  );
}

function Stats(props) {
  const gridWidth = props.four !== undefined ? 3 : 4;
  return (
    <Grid container justifyContent="center" style={gridStyle}>
      <span style={spanStyle}>
        {props.title}
        <Line style={{ marign: '0px' }} />
      </span>
      <StatBalance gridWidth={gridWidth} {...props.one} />
      <StatBalance gridWidth={gridWidth} {...props.two} />
      <StatBalance gridWidth={gridWidth} {...props.three} />
      {props.four !== undefined ? (
        <StatBalance
          gridWidth={gridWidth}
          style={
            isNaN(props.four.balance) ? { fontFamily: 'Futura-Pt-Book' } : null // eslint-disable-line
          }
          {...props.four}
        />
      ) : null}
    </Grid>
  );
}

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
    nextSowTime,
    lastSowTime,
    // didSowBelowMin,
    // didSowFaster,
    weather,
    raining,
    rainStart,
  } = useSelector<AppState, AppState['weather']>((state) => state.weather);

  const price = beanTWAPPrice.dividedBy(usdcTWAPPrice);
  const podRate = totalPods.dividedBy(totalBeans).multipliedBy(100);
  const deltaSoil = startSoil.minus(soil);
  // const deltaDemand = (
  //   deltaSoil.isEqualTo(0)
  //     ? new BigNumber(0)
  //     : lastDSoil.isEqualTo(0)
  //       ? new BigNumber(100000)
  //       : deltaSoil.dividedBy(lastDSoil)
  // )
  let deltaDemand = new BigNumber(0);
  if (nextSowTime < MAX_UINT32) {
    if (lastSowTime === MAX_UINT32 || nextSowTime < 300 ||
      (
        lastSowTime.isGreaterThan(new BigNumber(STEADY_SOW_TIME)) &&
        nextSowTime.isLessThan(lastSowTime.minus(new BigNumber(STEADY_SOW_TIME)))
      )
    ) {
      deltaDemand = new BigNumber(10000000);
    } else if (nextSowTime.isLessThanOrEqualTo(lastSowTime.plus(STEADY_SOW_TIME))) {
      deltaDemand = new BigNumber(1);
    } else {
      deltaDemand = new BigNumber(0);
    }
  } else {
    deltaDemand = !deltaSoil.isEqualTo(0)
      ? !lastDSoil.isEqualTo(0)
        ? deltaSoil.dividedBy(lastDSoil)
        : new BigNumber(10000000)
      : new BigNumber(0);
  }
  // console.log(deltaDemand.toString());

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
    caseId += 1;
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

  const rainingSeasons = season.minus(rainStart);
  const rainNextSeason = caseId > 3 && caseId < 8;
  let rainForecast;
  if (raining && rainNextSeason) rainForecast = 'More Showers';
  else if (rainNextSeason) rainForecast = 'Start';
  else if (raining) rainForecast = 'Stop';
  else rainForecast = 'Sun';

  const nextSeasonStats = {
    title: 'Next Season',
    one: {
      title: 'New Beans',
      balance: displayBN(newBeans),
      description: pegStrings.newBeans,
      balanceDescription:
        newBeans.isGreaterThan(0) ? `${displayFullBN(newBeans)} Beans` : undefined,
      placement: 'bottom',
    },
    two: {
      title: 'New Soil',
      balance: displayBN(newSoil, true),
      description: pegStrings.newSoil,
      balanceDescription:
        newSoil.isEqualTo(0) ? undefined : `${displayFullBN(newSoil)} Soil`,
      placement: 'bottom',
    },
    three: {
      title: 'Weather Forecast',
      balance: `${weather.plus(deltaWeather)}%`,
      description: pegStrings.weather,
      balanceDescription:
        deltaWeather !== 0
          ? `${weather.plus(deltaWeather).toString()}% Weather`
          : undefined,
      placement: 'bottom',
    },
    four: {
      title: 'Rain Forecast',
      balance: rainForecast,
      description: pegStrings.rainForecast,
    },
  };

  const currentSeasonStats = {
    title: 'Current Season',
    one: {
      title: 'Price',
      balance: `$${price.toFixed(4)}`,
      description: pegStrings.price,
      balanceDescription: `$${displayFullBN(price)} Price`,
      placement: 'bottom',
    },
    two: {
      title: 'Pod Rate',
      balance: `${displayBN(podRate)}%`,
      description: pegStrings.podRate,
      balanceDescription: podRate.isGreaterThan(0)
        ? `${displayFullBN(podRate)}% Pod Rate`
        : undefined,
      placement: 'bottom',
    },
    three: {
      title: 'Delta Demand',
      balance:
        // lastDSoil.isEqualTo(0) && deltaSoil.isGreaterThan(0) ? (
        deltaDemand.isEqualTo(new BigNumber('10000000')) ? (
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
  };
  if (raining) {
    currentSeasonStats.four = {
      title: 'Seasons of Rain',
      balance: displayBN(rainingSeasons.plus(1)),
      description: pegStrings.rain,
    };
  }

  return (
    <Grid
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
          <span style={pegMaintenanceSpanStyle}>
            Peg Maintenance
            <QuestionModule
              description={pegStrings.pegTableDescription}
              margin="-6px 0 0 2px"
            />
          </span>
          <Line style={lineStyle} />
          <Stats {...nextSeasonStats} />
          <Stats {...currentSeasonStats} />
        </Box>
      </Grid>
    </Grid>
  );
}
