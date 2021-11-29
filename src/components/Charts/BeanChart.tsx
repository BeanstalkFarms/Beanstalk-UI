import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Box } from '@material-ui/core';
import { theme as colorTheme } from 'constants/index';
import BeanLogo from 'img/bean-logo.svg';
import BaseLabels from './BaseLabel';
import BaseChart from './BaseChart';

const BeanChart = (props: any) => {
  const [from, setFrom] = React.useState<number>();
  const [fitAll, setFitAll] = React.useState<boolean>(false);
  const [dateScale, setDateScale] = React.useState<string>();
  const state = {
    options: {
      alignLabels: false,
      grid: {
        vertLines: {
          visible: false,
        },
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: true,
        },
        vertLine: {
          visible: true,
          labelVisible: true,
        },
      },
      timeScale: {
        rightOffset: 12,
        barSpacing: 3,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: false,
        borderVisible: false,
        borderColor: '#fff000',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
      },
      priceScale: {
        title: 'Price',
        position: 'right',
        autoScale: true,
        drawTicks: true,
        PriceLineSource: 'LastVisible',
        priceRange: {
          minValue: 0,
          maxValue: 3,
        },
        borderColor: '#ffff',
        scaleMargins: {
          top: 0.30,
          bottom: 0.25,
        },
      },
      baseline: {
        topFillColor1: 'rgba(21, 146, 230, 0.4)',
        topFillColor2: 'rgba(21, 255, 70, 0.3)',
        bottomFillColor1: 'rgba(21, 255, 70, 0.3)',
        bottomFillColor2: 'rgba(21, 146, 230, 0.4)',
        topLineColor: 'rgba(21, 146, 230, 1)',
        lineStyle: 0,
        lineWidth: 3,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 3,
        crosshairMarkerBorderColor: 'rgb(255, 255, 255, 1)',
        crosshairMarkerBackgroundColor: 'rgb(34, 150, 243, 1)',
        baseValue: {
          type: 'price',
          price: 1,
        },
        priceFormat: {
          type: 'price',
          precision: 3,
          minMove: 0.001,
        },
        legend: {
          color: 'rgba(255, 0, 255, 100)',
          title: 'Baseline Price',
        },
      },
    },
  };

  const customDarkTheme = {
    layout: {
      backgroundColor: '#131722',
      lineColor: '#2B2B43',
      textColor: '#D9D9D9',
    },
    grid: {
      vertLines: {
        color: '#363c4e',
      },
      horzLines: {
        color: '#363c4e',
      },
    },
  };
  const lightTheme = {
    layout: {
      backgroundColor: colorTheme.module.background,
      lineColor: '#2B2B43',
      textColor: '#191919',
    },
    grid: {
      vertLines: {
        color: colorTheme.text,
      },
      horzLines: {
        color: colorTheme.text,
      },
    },
  };
  const colors = [
    '#008FFB',
    '#00E396',
    '#FEB019',
    '#FF4560',
    '#775DD0',
    '#F86624',
    '#A5978B',
  ];

  const classes = makeStyles({
    timeRangeBtn: {
      borderRadius: '12px',
      fontFamily: 'Futura-Pt-Book',
      fontSize: 'calc(10px + 1vmin)',
      height: '10px',
      width: '100px',
      cursor: 'pointer',
    },
  })();

  const setDateRange = (daysToSubtract: number | string): void => {
    if (daysToSubtract === 'all') {
      setFitAll(true);
    } else {
      setFitAll(false);
      const dateOffset = (24 * 60 * 60 * 1000) * daysToSubtract;
      const newFrom = new Date(new Date().getTime() - dateOffset).getTime() / 1000;
      setFrom(newFrom);
    }
  };

  const timeRangeSelectButtons = () => {
    const timeRangeButtons = [
      {
        label: '1d',
        value: 1,
      },
      {
        label: '1w',
        value: 7,
      },
      {
        label: '1m',
        value: 30,
      },
      {
        label: 'All Time',
        value: 'all',
      },
    ];
    return (
      <>
        {timeRangeButtons.map((button) => (
          <Button
            className={classes.timeRangeBtn}
            key={button.value}
            onClick={() => {
              setDateRange(button.value);
            }}
          >
            {button.label}
          </Button>))}
      </>
    );
  };

  const timeScaleSelectButtons = () => {
    const timeRangeButtons = [
      {
        label: 'Hour',
        value: 'hour',
      },
      {
        label: 'Day',
        value: 'day',
      },
    ];
    return (
      <>
        {timeRangeButtons.map((button) => (
          <Button
            className={classes.timeRangeBtn}
            key={button.value}
            onClick={() => {
              setDateScale(button.value);
            }}
          >
            {button.label}
          </Button>))}
      </>
    );
  };

  React.useEffect(() => {
    setDateRange(4);
    setDateScale('hour');
  }, []);

  const hasData = props.charts?.map((chart) => chart.data[0]?.length > 0 && chart.data[1]?.length > 0).reduce((a, b) => a || b, false);
  const n = !props.isMobile;
  const to = new Date().getTime() / 1000; // current timestamp

  console.log('hasData', hasData);
  if (!hasData) {
    const loadingStyle = {
      borderRadius: '25px',
      padding: `${n ? '135px' : '60px'}`,
      fontFamily: 'Futura-Pt-Book',
      position: 'relative',
      height: `${n ? '370px' : '240px'}`,
    };
    return (
      <Box style={loadingStyle}>
        <Box className="Loading-logo">
          <img
            className="svg"
            name={colorTheme.name}
            style={{ verticalAlign: 'middle' }}
            height="100px"
            src={BeanLogo}
            alt="bean.money"
          />
        </Box>
      </Box>
    );
  }

  return (
    <>
      {timeScaleSelectButtons()}
      <BaseChart
        {...props}
        autoWidth
        height={300}
        options={state.options}
        from={from}
        to={to}
        fitAll={fitAll}
        colors={colors}
        timeScale={dateScale}
        backgroundTheme={{ customDarkTheme, lightTheme }}
      />
      <BaseLabels labels={['abc', 'def']} />
      {timeRangeSelectButtons()}
    </>
  );
};
export default BeanChart;
