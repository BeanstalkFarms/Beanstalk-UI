/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import equal from 'fast-deep-equal';
import { BaseModule } from 'components/Common';
import usePrevious from 'util/hooks/usePrevious';
import { mergeDeep } from 'util/AnalyticsUtilities';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import { theme } from '../../constants';

const BaseChart = (props) => {
  console.log(props);
  const {
    autoWidth,
    autoHeight,
    height,
    width,
    candlestickSeries,
    lineSeries,
    areaSeries,
    barSeries,
    histogramSeries,
    baselineSeries,
    onClick,
    onCrosshairMove,
    onTimeRangeMove,
    darkTheme,
    backgroundTheme,
    colors,
    options,
    from,
    to,
    fitAll,
  } = props;
  const prevProps = usePrevious(props);
  const chartDiv = React.useRef<any>();
  const [series, setSeries] = React.useState<any>([]);
  let chart: IChartApi;

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

  const handleLinearInterpolation = (data, candleTime) => {
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
      const data = handleLinearInterpolation(
        serie.data,
        serie.linearInterpolation
      );
      mySeries.setData(data);
      if (serie.markers) series.setMarkers(serie.markers);
      if (serie.priceLines) { serie.priceLines.forEach((line) => series.createPriceLine(line)); }
      if (serie.basevalue) {
        series.setBaseValue(serie.basevalue);
      }
    }
    return mySeries;
  };
  const handleSeries = () => {
    candlestickSeries &&
      candlestickSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'candlestick')]);
      });

    lineSeries &&
      lineSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'line')]);
      });

    areaSeries &&
      areaSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'area')]);
      });

    barSeries &&
      barSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'bar')]);
      });

    histogramSeries &&
      histogramSeries.forEach((serie) => {
        series.push(addSeries(serie, 'histogram'));
      });
    baselineSeries &&
      baselineSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'baseline')]);
      });
  };
  // const removeSeries = () => {
  //   series.forEach((serie) => {
  //     const result = chart?.removeSeries(serie);
  //     return result;
  //   });
  //   setSeries([]);
  // };

  const handleEvents = () => {
    onClick && chart?.subscribeClick(onClick);
    onCrosshairMove &&
      chart?.subscribeCrosshairMove(onCrosshairMove);
    onTimeRangeMove &&
      chart?.timeScale().subscribeVisibleTimeRangeChange(onTimeRangeMove);
  };
  const unsubscribeEvents = (previousProps) => {
    chart?.unsubscribeClick(previousProps.onClick);
    chart?.unsubscribeCrosshairMove(previousProps.onCrosshairMove);
    chart?.timeScale().unsubscribeVisibleTimeRangeChange(previousProps.onTimeRangeMove);
  };

  const handleTimeRange = () => {
    console.log('handle from to', from, to, fitAll);
    const visibleRange = chart?.timeScale().getVisibleRange();
    console.log(visibleRange);

    function onIndexRangeChanged(newRange) {
      console.log('newRange', newRange);
    }
    fitAll ? chart?.timeScale().fitContent() :
    from && to && chart?.timeScale().setVisibleRange({ from, to });
    chart?.timeScale().subscribeVisibleTimeRangeChange(onIndexRangeChanged);
  };

  const handleUpdateChart = () => {
    window.removeEventListener('resize', resizeHandler);
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
    chart = createChart(chartDiv.current);
    handleUpdateChart();
    resizeHandler();
  }, []);

  React.useEffect(() => {
    // ComponentDidUpdate
    if (!autoWidth && !autoHeight) { window.removeEventListener('resize', resizeHandler); }
    if (prevProps) {
      if (
        !equal(
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
        )
      ) { unsubscribeEvents(prevProps); }
      if (
        !equal(
          [
            prevProps.options,
            prevProps.darkTheme,
            prevProps.candlestickSeries,
            prevProps.lineSeries,
            prevProps.areaSeries,
            prevProps.barSeries,
            prevProps.histogramSeries,
          ],
          [
            options,
            darkTheme,
            candlestickSeries,
            lineSeries,
            areaSeries,
            barSeries,
            histogramSeries,
          ]
        )
      ) {
        // removeSeries();
        handleUpdateChart();
      } else if (prevProps.from !== from || prevProps.to !== to) {
        console.log('here', prevProps.from, from, prevProps.to, to);
        handleTimeRange();
      }
    }
  }, [prevProps]);

  return (
    <div ref={chartDiv} style={{ position: 'relative' }} />
  );
};

const ChartWrapper = (props) => {
  const [from, setFrom] = React.useState<number>();
  const [all, setAll] = React.useState<boolean>(false);

  const sectionTitles = ['Chart'];

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

  const setDateRange = (daysToSubtract: number): void => {
    const dateOffset = (24 * 60 * 60 * 1000) * daysToSubtract;
    setFrom(new Date(new Date().getTime() - dateOffset).getTime() / 1000);
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
    ];
    return (
      <>
        {timeRangeButtons.map((button) => (
          <Button
            className={classes.timeRangeBtn}
            key={button.value}
            onClick={() => setDateRange(button.value)}
          >
            {button.label}
          </Button>))}
        <Button
          className={classes.timeRangeBtn}
          key="All"
          onClick={() => setAll(!all)}
        >
          All
        </Button>
      </>
    );
  };

  React.useEffect(() => {
    setDateRange(4);
  }, []);

  const to = new Date().getTime() / 1000;

  return (
    <BaseModule
      handleForm={() => { }}
      sectionTitles={sectionTitles}
      showButton={false}
    >
      <BaseChart {...props} from={from} to={to} fitAll={all} colors={colors} backgroundTheme={{ customDarkTheme, lightTheme }} />
      {timeRangeSelectButtons()}
    </BaseModule>
  );
};
export * from 'lightweight-charts';
export default ChartWrapper;
