import React from 'react';
import { Box } from '@material-ui/core';
import {
  Axis, // any of these can be non-animated equivalents
  Grid,
  XYChart,
  Tooltip,
  AnimatedAreaSeries,
  AnimatedLineSeries,
  buildChartTheme,
} from '@visx/xychart';
import BeanLogo from 'img/bean-logo.svg';
import { theme as colorTheme } from 'constants/index';
import { makeStyles } from '@material-ui/core/styles';
import { DataSelector, TimeSelector } from './Selectors';

const useStyles = makeStyles(({
  chartStyle: {
    borderRadius: '25px',
    padding: '10px',
    paddingTop: (props: any) => `${!props.isMobile ? '30px' : '40px'}`,
    fontFamily: 'Futura-Pt-Book',
    position: 'relative',
    height: (props: any) => `${!props.isMobile ? '370px' : '250px'}`,
    backgroundColor: colorTheme.module.foreground,
  },
  loadingStyle: {
      borderRadius: '25px',
      padding: (props: any) => `${!props.isMobile ? '135px' : '60px'}`,
      fontFamily: 'Futura-Pt-Book',
      position: 'relative',
      height: (props: any) => `${!props.isMobile ? '370px' : '240px'}`,
      backgroundColor: colorTheme.module.background,
    }
}));

export function Chart(props) {
  const classes = useStyles(props);
  const n = !props.isMobile;

  const theme = buildChartTheme({
    backgroundColor: colorTheme.module.foreground,
    colors: ['#444444', '#888888'],
    gridColor: '#99AB91',
    gridColorDark: '#99AB91',
    svgLabelBig: { fill: '#1d1b38' },
    tickLength: 8,
  });
  const accessors = {
    xAccessor: (d) => d.x,
    yAccessor: (d) => d.y,
  };

  const useDataMode = props.data.length > 1;
  const dataMode = useDataMode ? props.dataMode : 'hr';
  let data = dataMode === 'hr' ? [...props.data[0]] : [...props.data[1]];

  if (data.length === 0) {
    return (
      <Box className={classes.loadingStyle}>
        <Box className="Loading-logo">
          <img
            className="svg"
            name={colorTheme.name}
            style={{ verticalAlign: 'middle' }}
            height="100px"
            src={BeanLogo}
            alt="app.bean.money"
          />
        </Box>
      </Box>
    );
  }

  if (props.timeMode === 'week') {
    data = data.filter((d) => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return d.x > date;
    });
  } else if (props.timeMode === 'month') {
    data = data.filter((d) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return d.x > date;
    });
  }

  let xTicks = 7;
  if (props.timeMode === 'all ' && props.isMobile) xTicks = 2;

  const toolTipFormatter =
    props.dataMode === 'hr'
      ? (d) =>
          `${d.toDateString().split(' ')[1]} ${d.getDate()}, ${d.getHours()}:00`
      : (d) => `${d.toDateString().split(' ')[1]} ${d.getDate()}`;

  const yAxisTickFormatter = (d) => {
    if (props.title === 'Price') return d.toFixed(2);
    if (d >= 1000000) return `${(d / 1000000).toLocaleString('en-US')}m`;
    if (d >= 10000) return `${(d / 1000).toLocaleString('en-US')}k`;
    if (d >= 1) return `${d.toLocaleString('en-US')}`;
    if (d >= 0.1) return `${d === 0 ? d : d.toFixed(2)}`;
    return `${d}`;
  };

  const chartMargin = n
    ? { top: 30, right: 60, bottom: 60, left: 70 }
    : { top: 10, right: 20, bottom: 50, left: 65 };

  const frontUnit =
    props.unit !== undefined && props.unit !== '%' ? props.unit : '';

  const backUnit =
    props.unit !== undefined && props.unit === '%' ? props.unit : '';

  function getLineForTitle(_title, _data) {
    if (_title === 'Price') {
      const line = data.reduce((acc, d) => {
        acc.push({ x: d.x, y: 1 });
        return acc;
      }, []);
      return [
        <AnimatedAreaSeries
          key="price"
          fillOpacity={0.4}
          y0Accessor={() => 1}
          dataKey="Price"
          data={_data}
          {...accessors}
        />,
        <AnimatedLineSeries key="$1" data={line} {...accessors} />,
      ];
    }
    return [
      <AnimatedLineSeries
        key="data"
        dataKey={_title}
        data={_data}
        {...accessors}
      />,
    ];
  }

  return (
    <Box className={classes.chartStyle}>
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
      <XYChart
        theme={theme}
        height={n ? 330 : 210}
        margin={chartMargin}
        xScale={{ type: 'time' }}
        yScale={{ type: 'linear', zero: false, nice: true }}
      >
        <Tooltip
          snapTooltipToDatumX
          snapTooltipToDatumY
          showVerticalCrosshair
          showSeriesGlyphs
          renderTooltip={({ tooltipData, colorScale }) => (
            <Box>
              <Box
                sx={{
                  color: colorScale(tooltipData.datumByKey[props.title].key),
                }}
              >
                {tooltipData.datumByKey[props.title].key}
              </Box>
              <Box sx={{ marginTop: '5px' }}>
                {`${frontUnit}${accessors
                  .yAccessor(tooltipData.datumByKey[props.title].datum)
                  .toLocaleString('en-US')}
                  ${backUnit}`}
              </Box>
              <Box sx={{ marginTop: '5px', color: '#777777' }}>
                {toolTipFormatter(
                  accessors.xAccessor(tooltipData.datumByKey[props.title].datum)
                )}
              </Box>
            </Box>
          )}
        />
        <Axis
          label="Time"
          orientation="bottom"
          tickLength={xTicks}
          numTicks={n ? 7 : 3}
          tickFormat={(d) => `${d.toDateString().split(' ')[1]} ${d.getDate()}`}
        />
        <Axis
          numTicks={6}
          tickLength={n ? 7 : 3}
          label={`${props.title}${
            props.unit !== undefined ? ` (${props.unit})` : ''
          }`}
          labelOffset={35}
          orientation="left"
          tickFormat={yAxisTickFormatter}
        />
        <Grid strokeDasharray={2} columns={false} numTicks={6} />
        {getLineForTitle(props.title, data)}
      </XYChart>
    </Box>
  );
}

Chart.defaultProps = {
  unit: undefined,
};
