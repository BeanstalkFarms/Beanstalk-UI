import React from 'react';
import { Box } from '@material-ui/core';
import { theme as colorTheme } from 'constants/index';
import BeanLogo from 'img/bean-logo.svg';
import BaseLabels from './BaseLabel';
import BaseChart from './BaseChart';
import { DataSelector, TimeSelector } from './Selectors';

const BeanChart = (props: any) => {
  const [from, setFrom] = React.useState<number>();
  const [fitAll, setFitAll] = React.useState<boolean>(false);
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
        position: 'left',
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
        baseValue: {
          type: 'price',
          price: 1,
        },
        priceFormat: {
          type: 'price',
          precision: 3,
          minMove: 0.001,
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
      backgroundColor: colorTheme.module.foreground,
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

  const setDateRange = (timeMode: string): void => {
    if (timeMode === 'all') {
      setFitAll(true);
    } else {
      setFitAll(false);
      const daysToSubtract = timeMode === 'week' ? 7 : timeMode === 'month' ? 30 : 365;
      const dateOffset = (24 * 60 * 60 * 1000) * daysToSubtract;
      const newFrom = new Date(new Date().getTime() - dateOffset).getTime() / 1000;
      setFrom(newFrom);
    }
  };

  React.useEffect(() => {
    setDateRange(props.timeMode);
  }, [props.timeMode]);

  const n = !props.isMobile;
  const to = new Date().getTime() / 1000; // current timestamp
  const useDataMode = props.data.length > 1;
  const dataMode = useDataMode ? props.dataMode : 'hr';
  const data = dataMode === 'hr' ? [...props.data[0]] : [...props.data[1]];

  const chartStyle = {
    borderRadius: '25px',
    padding: '10px',
    paddingTop: `${n ? '30px' : '40px'}`,
    fontFamily: 'Futura-Pt-Book',
    position: 'relative',
    height: `${n ? '370px' : '250px'}`,
    backgroundColor: colorTheme.module.foreground,
  };

  if (data.length === 0) {
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
    <Box style={chartStyle}>
      {useDataMode ? (
        <DataSelector
          size={props.size}
          isMobile={props.isMobile}
          setValue={props.setDataMode}
          value={dataMode}
        />
      ) : null}
      <TimeSelector
        size={props.size}
        isMobile={props.isMobile}
        setValue={props.setTimeMode}
        value={props.timeMode}
        dataMode={dataMode}
      />
      <hr style={{ marginTop: '20px' }} />
      <BaseChart
        {...props}
        autoWidth
        height={300}
        options={state.options}
        from={from}
        to={to}
        fitAll={fitAll}
        colors={colors}
        data={data}
        backgroundTheme={{ customDarkTheme, lightTheme }}
      />
      <BaseLabels labels={['abc', 'def']} />
    </Box>
  );
};
export default BeanChart;
