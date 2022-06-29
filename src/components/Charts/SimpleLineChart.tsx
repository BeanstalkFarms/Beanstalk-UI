import React, { useCallback, useMemo } from 'react';
import { bisector, extent, max, min } from 'd3-array';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { LinePath, Bar, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleTime, scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { withTooltip } from '@visx/tooltip';
import { DateValue } from '@visx/mock-data/lib/generators/genDateValue';
import { curveNatural, curveStep, curveBasis } from '@visx/curve';
import { BeanstalkPalette } from 'components/App/muiTheme';

export type DataPoint = {
  date: Date;
  value: number;
}

// data accessors
const getX = (d: DateValue) => d.date;
const getY = (d: DateValue) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => new Date(d.date)).left;

type GraphProps = {
  width: number;
  height: number;
  series: (DataPoint[])[];
  onCursor: (ds?: DataPoint[]) => void;
  isTWAP?: boolean;
}

// plot config
const margin = {
  top: 20,
  bottom: 20,
  left: 0,
  right: 0,
};
const strokes = [
  {
    stroke: BeanstalkPalette.logoGreen,
    strokeWidth: 3,
  },
  {
    stroke: BeanstalkPalette.darkBlue,
    strokeWidth: 2,
  },
  {
    stroke: BeanstalkPalette.lightishGrey,
    strokeWidth: 0.5,
  },
];

const Graph: React.FC<GraphProps> = withTooltip(({
  // Chart sizing
  width,
  height,
  // Tooltip
  showTooltip,
  hideTooltip,
  tooltipData,
  // tooltipTop = 0,
  tooltipLeft = 0,
  // Data
  series,
  // Events
  onCursor,
  isTWAP
}) => {
  const data = series[0];

  // scales
  const scales = useMemo(() => series.map((_data) => {
    const xScale = scaleTime<number>({
      domain: extent(_data, getX) as [Date, Date],
    });
    let yScale;
    if (isTWAP) {
      const yMin = min(_data, getY);
      const yMax = max(_data, getY);
      // sets the yScale so that 1 is always perfectly in the middle
      const biggestDifference = Math.max(Math.abs(1 - (yMin as number)), Math.abs(1 - (yMax as number)));
      yScale = scaleLinear<number>({
        domain: [1 - biggestDifference, 1 + biggestDifference],
      });
    } else {
      yScale = scaleLinear<number>({
        domain: [min(_data, getY) as number, max(_data, getY) as number],
      });
    }

    xScale.range([0, width]);
    yScale.range([height - margin.top, margin.bottom]);

    return { xScale, yScale };
  }), [width, height, series, isTWAP]);

  //
  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };

      // for each series
      const ds = scales.map((scale, i) => {
        const x0 = scale.xScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = series[i][index - 1];
        const d1 = series[i][index];
        let d = d0;
        if (d1 && getX(d1)) {
          d = x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }

        return d;
      });

      showTooltip({
        tooltipData: ds,
        tooltipLeft: x,
        // tooltipTop: syScale(getY(d)),
      });
      onCursor(ds);
    },
    [showTooltip, onCursor, data, scales, series],
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
    onCursor(undefined);
  }, [hideTooltip, onCursor]);

  return (
    <>
      <svg width={width} height={height}>
        {/**
          * Lines
          */}
        <Group>
          {series.map((_data, index) => (
            <>
              {isTWAP && (
                <LinePath<DateValue>
                  key={index}
                  curve={curveNatural}
                  data={_data}
                  x={(d) => scales[index].xScale(getX(d)) ?? 0}
                  y={scales[0].yScale(1)}
                  {...strokes[2]}
                />
              )}
              <LinePath<DateValue>
                key={index + 1}
                curve={isTWAP ? curveBasis : curveNatural}
                data={_data}
                x={(d) => scales[index].xScale(getX(d)) ?? 0}
                y={(d) => scales[index].yScale(getY(d)) ?? 0}
                {...strokes[index]}
              />
            </>
          ))}
        </Group>
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
            />
          </g>
        )}
        {/**
          * Overlay to handle tooltip.
          * Needs to be the last item to maintain mouse control.
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
      </svg>
    </>
  );
});

/**
 * Wrap the graph in a ParentSize handler.
 */
const SimpleLineChart: React.FC<{
  series: (DataPoint[])[];
  onCursor: GraphProps['onCursor'];
  isTWAP?: boolean; // used to indicate if we are displaying TWAP price
}> = (props) => (
  <ParentSize debounceTime={50}>
    {({ width: visWidth, height: visHeight }) => (
      <Graph
        width={visWidth}
        height={visHeight}
        series={props.series}
        onCursor={props.onCursor}
        isTWAP={props.isTWAP}
      />
    )}
  </ParentSize>
);

export default SimpleLineChart;

/* <circle
  cx={tooltipLeft}
  cy={tooltipTop + margin.top}
  r={4}
  fill="black"
  fillOpacity={0.1}
  stroke="black"
  strokeOpacity={0.1}
  strokeWidth={2}
  pointerEvents="none"
/> */
