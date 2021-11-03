import React from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import {
  BEAN,
  DELTA_POD_DEMAND_LOWER_BOUND,
  DELTA_POD_DEMAND_UPPER_BOUND,
  MAX_UINT32,
  OPTIMAL_POD_RATE,
  PEG_WEATHER_CASES,
  POD_RATE_LOWER_BOUND,
  POD_RATE_UPPER_BOUND,
  SOIL_MAX_RATIO_CAP,
  SOIL_MIN_RATIO_CAP,
  theme,
} from '../../constants';
import { displayBN, displayFullBN, MaxBN, TrimBN } from '../../util';
import { Line, DataBalanceModule, Grid, QuestionModule } from '../Common';

// const cases = [3,1,0,0,-1,-3,-3,0,3,1,0,0,-1,-3,-3,0,3,3,1,0,0,0,-1,0,3,3,1,0,1,0,-1,0]

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
  marginTop: '15px',
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

export default function PegMaintenance(props) {
  const price = props.beanTWAPPrice.dividedBy(props.usdcTWAPPrice);
  const podRate = props.totalPods.dividedBy(props.totalBeans).multipliedBy(100);
  const deltaSoil = props.startSoil.minus(props.soil);
  // const deltaDemand = (
  //   deltaSoil.isEqualTo(0)
  //     ? new BigNumber(0)
  //     : props.lastDSoil.isEqualTo(0)
  //       ? new BigNumber(100000)
  //       : deltaSoil.dividedBy(props.lastDSoil)
  // )
  const deltaDemand = !deltaSoil.isEqualTo(0)
    ? !props.lastDSoil.isEqualTo(0)
      ? deltaSoil.dividedBy(props.lastDSoil)
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
    if (props.lastSowTime.isEqualTo(MAX_UINT32) || !props.didSowBelowMin) caseId += 1;
    else if (props.didSowFaster) caseId += 2;
  }

  let deltaWeather = new BigNumber(PEG_WEATHER_CASES[caseId]);
  if (props.weather.plus(deltaWeather).isLessThanOrEqualTo(0)) deltaWeather = props.weather.minus(1);

  const currentBeans = props.beanReserve
    .multipliedBy(props.ethReserve)
    .dividedBy(props.beanTWAPPrice)
    .sqrt();
  const targetBeans = props.beanReserve
    .multipliedBy(props.ethReserve)
    .dividedBy(props.usdcTWAPPrice)
    .sqrt();

  let newBeans = new BigNumber(0);
  let newSoil = new BigNumber(0);
  if (currentBeans.isLessThan(targetBeans)) newBeans = targetBeans.minus(currentBeans);
  else if (targetBeans.isLessThan(currentBeans)) newSoil = currentBeans.minus(targetBeans);

  const minTotalSoil = props.totalBeans.multipliedBy(SOIL_MIN_RATIO_CAP);
  if (props.soil.isLessThan(minTotalSoil)) newSoil = MaxBN(minTotalSoil.minus(props.soil), newSoil);
  const maxTotalSoil = props.totalBeans.multipliedBy(SOIL_MAX_RATIO_CAP);

  if (
    props.soil.isGreaterThan(maxTotalSoil) &&
    props.soil.plus(newSoil).isGreaterThan(maxTotalSoil)
  ) {
    newSoil = props.soil.minus(maxTotalSoil);
  } else if (props.soil.plus(newSoil).isGreaterThan(maxTotalSoil)) {
    newSoil = maxTotalSoil.minus(props.soil);
  }

  const rainingSeasons = props.season.minus(props.rainStart);
  const rainNextSeason = caseId > 3 && caseId < 8;
  let rainForecast;
  if (props.raining && rainNextSeason) rainForecast = 'More Showers';
  else if (rainNextSeason) rainForecast = 'Start';
  else if (props.raining) rainForecast = 'Stop';
  else rainForecast = 'Sun';
  newBeans = TrimBN(newBeans, BEAN.decimals);
  newSoil = TrimBN(newSoil, BEAN.decimals);

  const nextSeasonStats = {
    title: 'Next Season',
    one: {
      title: 'New Beans',
      balance: displayBN(newBeans),
      description:
        'This is the number of new Beans expected to be minted at the beginning of next Season based on the current TWAP.',
      balanceDescription:
        newBeans > 0 ? `${displayFullBN(newBeans)} Beans` : undefined,
      placement: 'bottom',
    },
    two: {
      title: 'New Soil',
      balance: displayBN(newSoil),
      description:
        'This is the number of new Soil expected to be minted at the beginning of next Season based on the current TWAP.',
      balanceDescription:
        newSoil > 0 ? `${displayFullBN(newSoil)} Soil` : undefined,
      placement: 'bottom',
    },
    three: {
      title: 'Weather Forecast',
      balance: `${props.weather.plus(deltaWeather)}%`,
      description:
        'The Weather Forecast predicts the expected Weather next Season based on the current TWAP, Pod Rate, and Delta Demand.',
      balanceDescription:
        deltaWeather !== 0
          ? `${props.weather.plus(deltaWeather).toString()}% Weather`
          : undefined,
      placement: 'bottom',
    },
    four: {
      title: 'Rain Forecast',
      balance: rainForecast,
      description:
        'The Rain Forecast predicts whether it is expected to Rain next Season or not. It is expected to Rain if TWAP > 1 and Pod Rate < 5%.',
    },
  };

  const currentSeasonStats = {
    title: 'Current Season',
    one: {
      title: 'Price',
      balance: `$${price.toFixed(4)}`,
      description:
        'This is the time weighted average Bean price during the course of the current Season.',
      balanceDescription: `$${displayFullBN(price)} Price`,
      placement: 'bottom',
    },
    two: {
      title: 'Pod Rate',
      balance: `${displayBN(podRate)}%`,
      description:
        'This is the total Unharvestable Pods as a percent of total Bean supply. The Pod Rate is the Beanstalk debt level relative to the current Bean supply.',
      balanceDescription: podRate.isGreaterThan(0)
        ? `${displayFullBN(podRate)}% Pod Rate`
        : undefined,
      placement: 'bottom',
    },
    three: {
      title: 'Delta Demand',
      balance:
        props.lastDSoil.isEqualTo(0) && deltaSoil.isGreaterThan(0) ? (
          <span>
            <span style={{ fontSize: '19px' }}>&#8734;</span>%
          </span>
        ) : (
          `${deltaDemand.multipliedBy(100).toFixed(2)}%`
        ),
      description:
        'Delta Demand is the rate of change in demand for Pods over the past two Seasons. Delta Demand is computed as Beans sown this Season / Beans sown last Season.',
      balanceDescription:
        props.lastDSoil.isEqualTo(0) || deltaSoil.isGreaterThan(0)
          ? undefined
          : `${displayBN(deltaDemand)}% Change in Demand`,
      placement: 'bottom',
    },
  };
  if (props.raining) {
    currentSeasonStats.four = {
      title: 'Seasons of Rain',
      balance: displayBN(rainingSeasons.plus(1)),
      description:
        'This is the number of consecutive Seasons it has been Raining for.',
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
              description="Below are the primary datapoints of the state of Beanstalk."
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
