/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import equal from 'fast-deep-equal';
import { BaseModule } from 'components/Common';
import usePrevious from 'util/hooks/usePrevious';
import { mergeDeep } from 'util/AnalyticsUtilities';
import { theme } from '../../constants';

const BaseChart = (props) => {
  const {
    autoWidth,
    autoHeight,
    height,
    width,
    legend,
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
  } = props;
  const prevProps = usePrevious(props);
  const chartDiv = React.useRef<any>();
  const legendDiv = React.useRef<any>();
  const [series, setSeries] = React.useState<any>([]);
  const [legends, setLegends] = React.useState<any>([]);
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

  const handleMainLegend = () => {
    if (legendDiv.current) {
      const row = document.createElement('div');
      row.innerText = legend;
      legendDiv.current.appendChild(row);
    }
  };
  const addLegend = (newSeries, color, title) => {
    const toPush = { newSeries, color, title };
    setLegends({ ...legends, toPush });
  };
  const handleLegends = (param) => {
    const div = legendDiv.current;
    if (param.time && div && legends.length) {
      div.innerHTML = '';
      legends.forEach(({ newSeries, color, title }) => {
        let price = param.seriesPrices.get(newSeries);
        if (price !== undefined) {
          if (typeof price === 'object') {
            color =
              price.open < price.close
                ? 'rgba(0, 150, 136, 0.8)'
                : 'rgba(255,82,82, 0.8)';
            price = `O: ${price.open}, H: ${price.high}, L: ${price.low}, C: ${price.close}`;
          }
          const row = document.createElement('div');
          row.innerText = `${title} `;
          const priceElem = document.createElement('span');
          priceElem.style.color = color;
          priceElem.innerText = ` ${price}`;
          row.appendChild(priceElem);
          div.appendChild(row);
        }
      });
    }
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
      if (serie.legend) {
        addLegend(series, color, serie.legend);
      }
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

    // handle legend dynamical change
    chart?.subscribeCrosshairMove(handleLegends);
  };
  const unsubscribeEvents = (previousProps) => {
    chart?.unsubscribeClick(previousProps.onClick);
    chart?.unsubscribeCrosshairMove(previousProps.onCrosshairMove);
    chart?.timeScale().unsubscribeVisibleTimeRangeChange(previousProps.onTimeRangeMove);
  };

  const handleTimeRange = () => {
    from && to && chart?.timeScale().setVisibleRange({ from, to });
    // chart?.timeScale().fitContent();
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

    if (legendDiv.current) legendDiv.current.innerHTML = '';
    setLegends([]);
    if (legend) handleMainLegend();
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
        handleTimeRange();
      }
    }
  }, [prevProps]);

  const color = darkTheme
    ? customDarkTheme.layout.textColor
    : lightTheme.layout.textColor;

  return (
    <div ref={chartDiv} style={{ position: 'relative' }}>
      <div
        ref={legendDiv}
        style={{
          position: 'absolute',
          zIndex: 2,
          color,
          padding: 10,
        }}
      />
    </div>
  );
};

const ChartWrapper = (props) => {
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

  return (
    <BaseModule
      handleForm={() => { }}
      sectionTitles={sectionTitles}
      showButton={false}
    >
      <BaseChart {...props} colors={colors} backgroundTheme={{ customDarkTheme, lightTheme }} />
    </BaseModule>
  );
};
export * from 'lightweight-charts';
export default ChartWrapper;
