import React from 'react';

import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Group } from '@visx/group';

import VisxPie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { scaleOrdinal } from '@visx/scale';
import { animated, useTransition, interpolate } from 'react-spring';
import mockLiquidity, { LiquidityDatum, mockLiquidityByToken } from './Pie.mock';
import { Stack, Typography } from '@mui/material';

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            }),
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="#222"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={10}
              fontFamily="Futura PT"
              fontWeight="bold"
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}

const getBrowserColor = scaleOrdinal({
  domain: Object.keys(mockLiquidityByToken),
  range: [
    'rgba(31, 120, 180, 0.3)',
    'rgba(70, 185, 85, 1)',
    'rgba(178, 223, 138, 0.3)',
    'rgba(25, 135, 59, 0.2)',
  ],
});

const defaultMargin = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

const Pie : React.FC<{
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  data: PieDataPoint[];
}> = ({
  width,
  height,
  margin = defaultMargin,
  animate = true,
  data,
}) => {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  if (!data || data.length === 0) {
    return (
      <Stack sx={{ width, height }} alignItems="center" justifyContent="center">
        <Typography color="text.secondary">
          No data
        </Typography>
      </Stack>
    );
  }

  return (
    <svg width={width} height={height}>
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <VisxPie
          data={data}
          pieValue={(elem) => elem.value}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
        >
          {(pie) => (
            <AnimatedPie<LiquidityDatum>
              {...pie}
              animate={animate}
              getKey={(arc) => arc.data.label}
              onClickDatum={({ data: { label } }) => {}}
              getColor={(arc) => getBrowserColor(arc.data.label)}
            />
          )}
        </VisxPie>
      </Group>
    </svg>
  );
};

export type PieDataPoint = {
  label: string;
  value: number;
}

/**
 * Wrap the graph in a ParentSize handler.
 */
const ResizablePieChart : React.FC<{
  data: PieDataPoint[];
  // onCursor: GraphProps['onCursor'];
}> = (props) => (
  <ParentSize debounceTime={50}>
    {({ width: visWidth, height: visHeight }) => (
      <Pie
        width={visWidth}
        height={visHeight}
        data={props.data}
        // series={props.series}
        // onCursor={props.onCursor}
      />
    )}
  </ParentSize>
);

export default ResizablePieChart;
