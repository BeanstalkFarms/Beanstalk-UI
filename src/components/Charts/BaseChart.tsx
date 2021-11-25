/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createChart, IChartApi, MouseEventHandler, TimeRangeChangeEventHandler } from 'lightweight-charts';
import equal from 'fast-deep-equal';
import usePrevious from 'util/hooks/usePrevious';
import { mergeDeep } from 'util/AnalyticsUtilities';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import { theme } from '../../constants';
import BaseLabels from './BaseLabel';

const BaseChart = (props: { autoHeight: any; autoWidth: any; backgroundTheme: any; charts: any; colors: any; darkTheme: any; fitAll: any; from: any; height: any; onClick: any; onCrosshairMove: any; onTimeRangeMove: any; options: any; to: any; timeScale: any; width: any; }) => {
  const {
    autoHeight,
    autoWidth,
    backgroundTheme,
    charts,
    colors,
    darkTheme,
    fitAll,
    from,
    height,
    onClick,
    onCrosshairMove,
    onTimeRangeMove,
    options,
    to,
    timeScale,
    width,
  } = props;
  const prevProps = usePrevious(props);
  const chartDiv = React.useRef<any>();
  const [series, setSeries] = React.useState<any>([]);
  const [chart, setChart] = React.useState<IChartApi>();
  const { customDarkTheme, lightTheme } = backgroundTheme;

  const addSeriesFunctions = {
    candlestick: 'addCandlestickSeries',
    line: 'addLineSeries',
    area: 'addAreaSeries',
    bar: 'addBarSeries',
    histogram: 'addHistogramSeries',
    baseline: 'addBaselineSeries',
  };
  const resizeHandler = () => {
    const newWidth =
      autoWidth &&
      chartDiv.current &&
      chartDiv.current.parentNode.clientWidth;
    const newHeight =
      autoHeight && chartDiv.current
        ? chartDiv.current.parentNode.clientHeight
        : height;

    chart?.resize(newWidth, newHeight);
  };

  const handleLinearInterpolation = (data: string | any[], candleTime: number) => {
    if (!candleTime || data.length < 2 || !data[0].value) return data;
    const first = data[0].time;
    const last = data[data.length - 1].time;
    const newData = new Array(Math.floor((last - first) / candleTime));
    newData[0] = data[0];
    const index = 1;
    for (let i = 1; i < data.length; i += 1) {
      newData[index + 1] = data[i];
      const prevTime = data[i - 1].time;
      const prevValue = data[i - 1].value;
      const { time, value } = data[i];
      for (
        let interTime = prevTime;
        interTime < time - candleTime;
        interTime += candleTime
      ) {
        // interValue get from the Taylor-Young formula
        const interValue =
          prevValue +
          (interTime - prevTime) *
          ((value - prevValue) / (time - prevTime));
        newData[index + 1] = { time: interTime, value: interValue };
      }
    }
    // return only the valid values
    return newData.filter((x) => x);
  };
  const addSeries = (serie, type) => {
    const func = addSeriesFunctions[type];
    const color =
      (serie.options && serie.options.color) ||
      colors[series.length % colors.length];
    let mySeries;

    if (chart) {
      mySeries = chart[func]({
        color,
        ...serie.options,
      });
      console.log('timescale', timeScale);
      const scaledData = timeScale === 'hour' ? serie.data[0] : serie.data[1];
      const data = handleLinearInterpolation(
        scaledData,
        serie.linearInterpolation
      );
      mySeries.setData(data);
      if (serie.markers) series.setMarkers(serie.markers);
      if (serie.priceLines) { serie.priceLines.forEach((line) => series.createPriceLine(line)); }
      if (serie.basevalue) {
        mySeries.setBaseValue(serie.basevalue);
      }
    }
    return mySeries;
  };
  const handleSeries = () => {
    const candlestickSeries = [{
      data: [
        [
          { time: new Date('2021-10-19').getTime() / 1000, open: 180.34, high: 180.99, low: 178.57, close: 179.85 },
          { time: new Date('2021-10-22').getTime() / 1000, open: 180.82, high: 181.40, low: 177.56, close: 178.75 },
          { time: new Date('2021-10-23').getTime() / 1000, open: 175.77, high: 179.49, low: 175.44, close: 178.53 },
          { time: new Date('2021-10-24').getTime() / 1000, open: 178.58, high: 182.37, low: 176.31, close: 176.97 },
          { time: new Date('2021-10-25').getTime() / 1000, open: 177.52, high: 180.50, low: 176.83, close: 179.07 },
          { time: new Date('2021-10-26').getTime() / 1000, open: 176.88, high: 177.34, low: 170.91, close: 172.23 },
          { time: new Date('2021-10-29').getTime() / 1000, open: 173.74, high: 175.99, low: 170.95, close: 173.20 },
          { time: new Date('2021-10-30').getTime() / 1000, open: 173.16, high: 176.43, low: 172.64, close: 176.24 },
          { time: new Date('2021-10-31').getTime() / 1000, open: 177.98, high: 178.85, low: 175.59, close: 175.88 },
          { time: new Date('2021-11-01').getTime() / 1000, open: 176.84, high: 180.86, low: 175.90, close: 180.46 },
          { time: new Date('2021-11-02').getTime() / 1000, open: 182.47, high: 183.01, low: 177.39, close: 179.93 },
          { time: new Date('2021-11-05').getTime() / 1000, open: 181.02, high: 182.41, low: 179.30, close: 182.19 },
        ],
        [
          { time: new Date('2021-11-02').getTime() / 1000, open: 182.47, high: 183.01, low: 177.39, close: 179.93 },
          { time: new Date('2021-11-05').getTime() / 1000, open: 181.02, high: 182.41, low: 179.30, close: 182.19 },
          { time: new Date('2021-11-07').getTime() / 1000, open: 176.84, high: 180.86, low: 175.90, close: 180.46 },
        ],
      ],
    }];
    if (candlestickSeries.length > 0 && candlestickSeries[0].data?.length > 0) {
      candlestickSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'candlestick')]);
      });
    }
    // const lineSeries = charts.filter((c) => c.type === 'line');
    // console.log('lineSeries', lineSeries);
    // if (lineSeries.length > 0 && lineSeries[0].data?.length > 0) {
    //   lineSeries.forEach((serie) => {
    //     setSeries([...series, addSeries(serie, 'line')]);
    //   });
    // }
    // const areaSeries = charts.filter((c) => c.type === 'area');
    // console.log('areaSeries', areaSeries);
    // if (areaSeries.length > 0 && areaSeries[0].data?.length > 0) {
    //   areaSeries.forEach((serie) => {
    //     setSeries([...series, addSeries(serie, 'area')]);
    //   });
    // }
    // const barSeries = charts.filter((c) => c.type === 'bar');
    // console.log('barSeries', barSeries);
    // if (barSeries.length > 0 && barSeries[0].data?.length > 0) {
    //   barSeries.forEach((serie) => {
    //     setSeries([...series, addSeries(serie, 'bar')]);
    //   });
    // }
    // const histogramSeries = charts.filter((c) => c.type === 'histogram');
    // console.log('histogramSeries', histogramSeries);
    // if (histogramSeries.length > 0 && histogramSeries[0].data?.length > 0) {
    //   histogramSeries.forEach((serie) => {
    //     series.push(addSeries(serie, 'histogram'));
    //   });
    // }
    const baselineSeries = charts.filter((c: { type: string; }) => c.type === 'baseline');
    if (baselineSeries.length > 0 && baselineSeries[0].data?.length > 0) {
      baselineSeries.forEach((serie: { options: any; }) => {
        const newSerie = addSeries(serie, 'baseline');
        console.log(newSerie);
        serie.options = options.baseline;
        setSeries([...series, newSerie]);
      });
    }
  };

  const removeSeries = () => {
    console.log('remove chart');
    try {
      series.forEach((serie) => {
        console.log('serie', serie);
        if (serie) chart?.removeSeries({ ...serie });
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleEvents = () => {
    onClick && chart?.subscribeClick(onClick);
    onCrosshairMove &&
      chart?.subscribeCrosshairMove(onCrosshairMove);
    onTimeRangeMove &&
      chart?.timeScale().subscribeVisibleTimeRangeChange(onTimeRangeMove);
  };
  const unsubscribeEvents = (previousProps: { onClick: MouseEventHandler; onCrosshairMove: MouseEventHandler; onTimeRangeMove: TimeRangeChangeEventHandler; }) => {
    chart?.unsubscribeClick(previousProps.onClick);
    chart?.unsubscribeCrosshairMove(previousProps.onCrosshairMove);
    chart?.timeScale().unsubscribeVisibleTimeRangeChange(previousProps.onTimeRangeMove);
  };

  const handleTimeRange = () => {
    try {
      if (from && to && chart) {
        if (fitAll) {
          chart.timeScale().resetTimeScale();
          chart.timeScale().fitContent();
        } else {
          chart.timeScale().setVisibleRange({ from, to });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateChart = () => {
    let customOptions = darkTheme ? customDarkTheme : lightTheme;

    customOptions = mergeDeep(customOptions, {
      width: autoWidth
        ? chartDiv.current.parentNode.clientWidth
        : width,
      height: autoHeight
        ? chartDiv.current.parentNode.clientHeight
        : height,
      ...options,
    });

    chart?.applyOptions(customOptions);

    handleSeries();
    handleEvents();
    handleTimeRange();

    if (autoWidth || autoHeight) {
      // resize the chart with the window
      window.addEventListener('resize', resizeHandler);
    }
  };

  React.useEffect(() => {
    const newChart = createChart(chartDiv.current);
    setChart(newChart);
  }, []);

  React.useEffect(() => {
    if (chart) {
      handleUpdateChart();
      resizeHandler();
    }
  }, [chart]);

  React.useEffect(() => {
    !autoWidth && !autoHeight &&
      window.removeEventListener('resize', resizeHandler);
  }, [autoWidth, autoHeight]);

  React.useEffect(() => {
    prevProps && !equal(
      [
        prevProps.onCrosshairMove,
        prevProps.onTimeRangeMove,
        prevProps.onClick,
      ],
      [
        onCrosshairMove,
        onTimeRangeMove,
        onClick,
      ]
    ) && unsubscribeEvents(prevProps);
  }, [prevProps?.onCrosshairMove, prevProps?.onClick, prevProps?.onTimeRangeMove, onCrosshairMove, onTimeRangeMove, onClick]);

  React.useEffect(() => {
    if (
      prevProps && !equal([prevProps.charts, prevProps.options], [charts, options])
    ) {
      removeSeries();
      handleUpdateChart();
    }
  }, [prevProps?.charts, charts, prevProps?.options, options]);

  React.useEffect(() => {
    if (!prevProps) return;
    if (prevProps.from !== from || prevProps.to !== to) {
      handleTimeRange();
    }
  }, [prevProps?.from, prevProps?.to, from, to]);

  return (
    <div ref={chartDiv} style={{ position: 'relative' }} />
  );
};

const ChartWrapper = (props: any) => {
  const [from, setFrom] = React.useState<number>();
  const [fitAll, setFitAll] = React.useState<boolean>(false);
  const [dateScale, setDateScale] = React.useState<string>('hour');
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
      backgroundColor: theme.module.background,
      lineColor: '#2B2B43',
      textColor: '#191919',
    },
    grid: {
      vertLines: {
        color: theme.text,
      },
      horzLines: {
        color: theme.text,
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
  }, []);

  const to = new Date().getTime() / 1000; // current timestamp

  return (
    <>
      {timeScaleSelectButtons()}
      <BaseChart
        {...props}
        // baselineSeries={chartsData}
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
export * from 'lightweight-charts';
export default ChartWrapper;
