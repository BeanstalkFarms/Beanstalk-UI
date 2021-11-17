/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import equal from 'fast-deep-equal';
import { BaseModule } from 'components/Common';
import { theme } from '../../constants';

const addSeriesFunctions = {
  candlestick: 'addCandlestickSeries',
  line: 'addLineSeries',
  area: 'addAreaSeries',
  bar: 'addBarSeries',
  histogram: 'addHistogramSeries',
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

const darkTheme = {
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

const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

const mergeDeep = (target, source) => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) { Object.assign(output, { [key]: source[key] }); } else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

const sectionTitles = ['Chart'];

function usePrevious(value) {
  const ref = React.useRef<any>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const BaseChart = (props) => {
  const prevProps = usePrevious(props);
  const chartDiv = React.createRef<any>();
  const legendDiv = React.createRef<any>();
  const [series, setSeries] = React.useState<any>([]);
  const [legends, setLegends] = React.useState<any>([]);
  let chart: IChartApi;

  const resizeHandler = () => {
    const width =
      props.autoWidth &&
      chartDiv.current &&
      chartDiv.current.parentNode.clientWidth;
    const height =
      props.autoHeight && chartDiv.current
        ? chartDiv.current.parentNode.clientHeight
        : props.height || 500;
    chart?.resize(width, height);
  };
  const unsubscribeEvents = (previousProps) => {
    chart?.unsubscribeClick(previousProps.onClick);
    chart?.unsubscribeCrosshairMove(previousProps.onCrosshairMove);
    chart?.timeScale().unsubscribeVisibleTimeRangeChange(previousProps.onTimeRangeMove);
  };

  const handleMainLegend = () => {
    if (legendDiv.current) {
      const row = document.createElement('div');
      row.innerText = props.legend;
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

    const mySeries = chart[func]({
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
    if (serie.legend) addLegend(series, color, serie.legend);
    return mySeries;
  };
  const handleSeries = () => {
    props.candlestickSeries &&
      props.candlestickSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'candlestick')]);
      });

    props.lineSeries &&
      props.lineSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'line')]);
      });

    props.areaSeries &&
      props.areaSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'area')]);
      });

    props.barSeries &&
      props.barSeries.forEach((serie) => {
        setSeries([...series, addSeries(serie, 'bar')]);
      });

    props.histogramSeries &&
      props.histogramSeries.forEach((serie) => {
        series.push(addSeries(serie, 'histogram'));
      });
  };
  const removeSeries = () => {
    series.forEach((serie) => chart?.removeSeries(serie));
    setSeries([]);
  };

  const handleEvents = () => {
    props.onClick && chart?.subscribeClick(props.onClick);
    props.onCrosshairMove &&
      chart?.subscribeCrosshairMove(props.onCrosshairMove);
    props.onTimeRangeMove &&
      chart?.timeScale().subscribeVisibleTimeRangeChange(props.onTimeRangeMove);

    // handle legend dynamical change
    chart?.subscribeCrosshairMove(handleLegends);
  };
  const handleTimeRange = () => {
    const { from, to } = props;
    from && to && chart?.timeScale().setVisibleRange({ from, to });
  };
  const handleUpdateChart = () => {
    window.removeEventListener('resize', resizeHandler);
    let options = props.darkTheme ? darkTheme : lightTheme;

    options = mergeDeep(options, {
      width: props.autoWidth
        ? chartDiv.current.parentNode.clientWidth
        : props.width,
      height: props.autoHeight
        ? chartDiv.current.parentNode.clientHeight
        : props.height || 500,
      ...props.options,
    });

    chart?.applyOptions(options);

    if (legendDiv.current) legendDiv.current.innerHTML = '';
    setLegends([]);
    if (props.legend) handleMainLegend();
    handleSeries();
    handleEvents();
    handleTimeRange();

    if (props.autoWidth || props.autoHeight) {
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
    if (!props.autoWidth && !props.autoHeight) { window.removeEventListener('resize', resizeHandler); }
    if (prevProps) {
      if (
        !equal(
          [
            prevProps.onCrosshairMove,
            prevProps.onTimeRangeMove,
            prevProps.onClick,
          ],
          [
            props.onCrosshairMove,
            props.onTimeRangeMove,
            props.onClick,
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
            props.options,
            props.darkTheme,
            props.candlestickSeries,
            props.lineSeries,
            props.areaSeries,
            props.barSeries,
            props.histogramSeries,
          ]
        )
      ) {
        removeSeries();
        handleUpdateChart();
      } else if (prevProps.from !== props.from || prevProps.to !== props.to) {
        handleTimeRange();
      }
    }
  }, [prevProps]);

  const color = props.darkTheme
    ? darkTheme.layout.textColor
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

const ChartWrapper = (props) => (
  <BaseModule
    handleForm={() => { }}
    sectionTitles={sectionTitles}
    showButton={false}
  >
    <BaseChart {...props} />
  </BaseModule>
);
export * from 'lightweight-charts';
export default ChartWrapper;
