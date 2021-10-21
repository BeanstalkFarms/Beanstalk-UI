import React from 'react';
import { Box } from '@material-ui/core';
import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedGrid,
  XYChart,
  Tooltip,
  AnimatedAreaSeries,
  AnimatedLineSeries,
  buildChartTheme,
} from '@visx/xychart';
import { DataSelector, TimeSelector } from './Selectors';
import { QuestionModule } from '../Common';

export function Chart(props) {
  const n = !props.isMobile;
  const chartStyle = {
    borderRadius: '25px',
    padding: '10px',
    fontFamily: 'Futura-Pt-Book',
    marginTop: '30px',
    position: 'relative',
    height: `${n ? '370px' : '240px'}`,
    backgroundColor: '#F5FAFF',
  };
  const lineStyle = {
    backgroundColor: 'primary',
    color: 'primary',
    margin: '10px 8px',
  };
  const titleStyle = {
    width: '100%',
    display: 'inline-block',
    textAlign: 'center',
    marginTop: '5px',
    fontFamily: 'Futura-Pt-Book',
    fontSize: n ? '20px' : '15px',
  };
  const theme = buildChartTheme({
    backgroundColor: '#F5FAFF',
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
  console.log(props.title);
  console.log(props.data);
  let data = dataMode === 'hr' ? [...props.data[0]] : [...props.data[1]];

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

  const toolTipFormatter =
    props.dataMode === 'hr'
      ? (d) =>
          `${d.toDateString().split(' ')[1]} ${d.getDate()}, ${d.getHours()}:00`
      : (d) => `${d.toDateString().split(' ')[1]} ${d.getDate()}`;

  const xAxisTickFormatter = (d) => {
    if (d > 1000000) return `${(d / 1000000).toFixed(2).toLocaleString('en-US')}m`;
    else if (d > 1000) return `${(d / 1000).toLocaleString('en-US')}k`; // eslint-disable-line
    else return `${d === 0 ? d : d.toFixed(2)}`;
  };

  const chartMargin = (
    n
      ? { top: 30, right: 60, bottom: 50, left: 65 }
      : { top: 10, right: 20, bottom: 40, left: 65 }
  );

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
    <Box className="AppBar-shadow" style={chartStyle}>
      {useDataMode ? <DataSelector
        size={props.size}
        isMobile={props.isMobile}
        setValue={props.setDataMode}
        value={dataMode}
      /> : null}
      <TimeSelector
        size={props.size}
        isMobile={props.isMobile}
        setValue={props.setTimeMode}
        value={props.timeMode}
        dataMode={dataMode}
      />
      <span style={titleStyle}>
        {props.title}
        <QuestionModule
          description={`This is the historical ${props.title} chart.`}
          margin="-6px 0 0 2px"
        />
      </span>
      <hr style={lineStyle} />
      <XYChart
        theme={theme}
        height={n ? 300 : 170}
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
                style={{
                  color: colorScale(tooltipData.datumByKey[props.title].key),
                }}
              >
                {tooltipData.datumByKey[props.title].key}
              </Box>
              <Box style={{ marginTop: '5px' }}>
                {`${props.usd ? '$' : ''}${accessors
                  .yAccessor(tooltipData.datumByKey[props.title].datum)
                  .toLocaleString('en-US')}`}
              </Box>
              <Box style={{ marginTop: '5px', color: '#777777' }}>
                {toolTipFormatter(
                  accessors.xAccessor(tooltipData.datumByKey[props.title].datum)
                )}
              </Box>
            </Box>
          )}
        />
        <AnimatedAxis
          label="Time"
          orientation="bottom"
          tickLength={n ? 7 : 3}
          numTicks={props.timeMode === 'week' ? 7 : 7}
          tickFormat={(d) => `${d.toDateString().split(' ')[1]} ${d.getDate()}`}
        />
        <AnimatedAxis
          numTicks={6}
          tickLength={n ? 7 : 3}
          label={`${props.title}${props.usd ? ' ($)' : ''}`}
          labelOffset={35}
          orientation="left"
          tickFormat={xAxisTickFormatter}
        />
        <AnimatedGrid strokeDasharray={2} columns={false} numTicks={6} />
        {getLineForTitle(props.title, data)}
      </XYChart>
    </Box>
  );
}

Chart.defaultProps = {
  usd: true,
};
