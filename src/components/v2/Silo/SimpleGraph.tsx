import React, { useCallback } from 'react';
import { DateTime } from 'luxon';
import { bisector, extent, max, min } from 'd3-array';

import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { LinePath, Bar, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleTime, scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import generateDateValue, { DateValue } from '@visx/mock-data/lib/generators/genDateValue';
import { curveNatural } from '@visx/curve';
import { BeanstalkPalette } from 'components/App/muiTheme';

export type DataPoint = {
  date: Date;
  value: number;
}

// Mock data
const today = DateTime.now();
const N = 30;
const data = new Array(N).fill(null).map((_, i) => ({
  date: today.minus({ days: N - i }).toJSDate(),
  value: 100_000 + 300 * i + 1000*Math.random(),
}));

// data accessors
const getX = (d: DateValue) => d.date;
const getY = (d: DateValue) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => new Date(d.date)).left;

// scales
const xScale = scaleTime<number>({
  domain: extent(data, getX) as [Date, Date],
});
const yScale = scaleLinear<number>({
  domain: [min(data, getY), max(data, getY) as number],
});

type GraphProps = {
  width: number;
  height: number; 
  onCursor: (d?: DataPoint) => void;
}

const margin = {
  top: 20,
  bottom: 20,
  left: 0,
  right: 0,
}

const Graph : React.FC<GraphProps> = withTooltip(({
  // Chart sizing
  width,
  height,
  // Tooltip
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0,
  // Events
  onCursor
}) => {
  xScale.range([0, width]);
  yScale.range([height - (margin.top + margin.bottom), 0]);

  //
  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getX(d1)) {
        d = x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf() ? d1 : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(getY(d)),
      });
      onCursor(d);
    },
    [showTooltip, onCursor/* yScale, xScale*/],
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor(undefined);
  }, [hideTooltip, onCursor])
  
  return (
    <>
      <svg width={width} height={height}>
        {/**
          * Overlay to handle tooltip
          */}
        <Bar
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={handleMouseLeave}
        />
        {/**
          * Cursor
          */}
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: height + margin.top }}
              stroke={BeanstalkPalette.lightishGrey}
              strokeWidth={1}
              pointerEvents="none"
              // strokeDasharray="5,2"
            />
            {/* <circle
              cx={tooltipLeft}
              cy={tooltipTop + margin.top}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            /> */}
          </g>
        )}
        {/**
          * Lines
          */}
        <Group top={margin.top}>
          <LinePath<DateValue>
            curve={curveNatural}
            data={data}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            stroke={BeanstalkPalette.logoGreen}
            strokeWidth={3}
          />
        </Group>
      </svg>
    </>
  );
});

/**
 * Wrap the graph in a ParentSize handler.
 */
const SimpleGraph : React.FC<{
  onCursor: GraphProps['onCursor']
}> = (props) => {
  return (
    <ParentSize debounceTime={50}>
      {({ width: visWidth, height: visHeight }) => (
        <Graph
          width={visWidth}
          height={visHeight}
          onCursor={props.onCursor}
        />
      )}
    </ParentSize>
  )
}

export default SimpleGraph;