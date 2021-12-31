import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import { Circle } from '@visx/shape';
import { withParentSize } from '@visx/responsive';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { theme as colorTheme } from 'constants/index';
import { AppState } from 'state';
import { GraphTooltip } from './GraphTooltip';

type CirclePosition = {
  x: number;
  y: number;
  radius: number;
};

const MIN_RADIUS = 3;
const MAX_RADIUS = 20;
// Calculates a circle radius between MIN_RADIUS and MAX_RADIUS based on the given plotSize
const calculateCircleRadius = (
  plotSize: number,
  maxPlotSize: number
): number => {
  const ratio = plotSize / maxPlotSize;
  return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * ratio;
};

// Returns the index of the element within positions that the given point is within.
// Returns undefined if point is not within any position.
const findPointInCircles = (
  positions: CirclePosition[],
  point: { x: number; y: number }
): number | undefined => {
  const foundPositions: number[] = [];
  for (let i = 0; i < positions.length; i += 1) {
    const position = positions[i];
    if (
      point.x >= position.x - position.radius &&
      point.x <= position.x + position.radius &&
      point.y >= position.y - position.radius &&
      point.y <= position.y + position.radius
    ) {
      foundPositions.push(i);
    }
  }

  // In case point is within multiple positions, choose the one with the smallest radius
  const minRadius = Math.min(
    ...foundPositions.map((index) => positions[index].radius)
  );
  return foundPositions.find((index) => positions[index].radius === minRadius);
};

interface GraphContentProps {
  parentWidth?: number;
}
const defaultGraphContentProps = {
  parentWidth: undefined,
};

const GraphContent = ({ parentWidth }: GraphContentProps) => {
  const graphHeight = 350;
  const leftAxisWidth = 70;
  const bottomAxisHeight = 50;
  // Amount of top vertical padding in between graph content and graph container
  const topVerticalPadding = 20;
  // Amount of right horizontal padding in between graph content and graph container
  const rightHorizontalPadding = 20;

  let { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  // Note: this is temporary test data
  listings = listings.concat([
    {
      listerAddress: 'yo',
      objectiveIndex: 1.5e6,
      pricePerPod: 0.99,
      expiresIn: 100,
      intialAmount: 1,
      amountSold: 1,
      status: 'yo',
    },
    {
      listerAddress: 'yo',
      objectiveIndex: 5e6,
      pricePerPod: 1.0,
      expiresIn: 100,
      intialAmount: 1,
      amountSold: 1,
      status: 'yo',
    },
    {
      listerAddress: 'yo',
      objectiveIndex: 40e6,
      pricePerPod: 0.4,
      expiresIn: 100,
      intialAmount: 1000,
      amountSold: 1000,
      status: 'yo',
    },
    {
      listerAddress: 'yo',
      objectiveIndex: 20e6,
      pricePerPod: 0.7,
      expiresIn: 100,
      intialAmount: 600,
      amountSold: 600,
      status: 'yo',
    },
  ]);

  const maxPlaceInLine = Math.max(...listings.map((l) => l.objectiveIndex));
  const maxPlotSize = Math.max(...listings.map((l) => l.amountSold));

  // Set max x value to be 1M or max place in line with some buffer
  const xDomain = [0, Math.max(maxPlaceInLine * 1.1, 1e6)];
  // Set max y value to be $1, price per pod should never exceed $1
  const yDomain = [0, 1];

  const svgRef = useRef<SVGSVGElement>(null);

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    hideTooltip,
    showTooltip,
    tooltipData,
  } = useTooltip();

  if (parentWidth === undefined) return <></>;

  const xScale = scaleLinear<number>({
    domain: xDomain,
    range: [0, parentWidth - leftAxisWidth - rightHorizontalPadding],
  });

  const yScale = scaleLinear<number>({
    domain: yDomain,
    range: [graphHeight - bottomAxisHeight, topVerticalPadding],
  });

  const circlePositions = listings.map((listing) => ({
    x: xScale(listing.objectiveIndex) + leftAxisWidth,
    y: yScale(listing.pricePerPod),
    radius: calculateCircleRadius(listing.amountSold, maxPlotSize),
  }));

  const circles = circlePositions.map((coordinate, i) => (
    <Circle
      pointerEvents="none"
      key={`point-${i}`}
      cx={coordinate.x}
      cy={coordinate.y}
      r={coordinate.radius}
      fill="#f7d186"
      stroke={i === tooltipData ? '#c8ab74' : '#d1cabc'}
      strokeWidth={2}
    />
  ));

  const handleMouseMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return;

    const point = localPoint(svgRef.current, event);
    if (!point) return;

    const foundIndex = findPointInCircles(circlePositions, point);
    if (foundIndex !== undefined) {
      const coordinate = circlePositions[foundIndex];

      // Show tooltip at bottom-right corner of circle position.
      // Nudge two pixels inward to make hovering easier.
      showTooltip({
        tooltipLeft: coordinate.x + coordinate.radius / Math.sqrt(2) - 2,
        tooltipTop: coordinate.y + coordinate.radius / Math.sqrt(2) - 2,
        tooltipData: foundIndex,
      });
    } else {
      hideTooltip();
    }
  };

  return (
    <>
      <svg width={parentWidth} height={graphHeight} ref={svgRef}>
        <rect
          width={parentWidth}
          height={graphHeight}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
        />
        {circles}
        <AxisLeft
          scale={scaleLinear({
            domain: yDomain,
            range: [graphHeight - bottomAxisHeight, topVerticalPadding],
          })}
          tickFormat={(d) => `$${d.toFixed(2)}`}
          label="Price Per Pod"
          labelProps={{ fontFamily: 'Futura-Pt-Book', textAnchor: 'middle' }}
          left={leftAxisWidth}
          labelOffset={40}
          numTicks={10}
          tickComponent={(props) => (
            <Text {...props} fontFamily="Futura-Pt-Book">
              {props.formattedValue}
            </Text>
          )}
          hideZero
        />
        <AxisBottom
          scale={scaleLinear({
            domain: xDomain,
            range: [0, parentWidth - leftAxisWidth - rightHorizontalPadding],
          })}
          tickFormat={(d) => `${d / 1e6}M`}
          label="Place In Line"
          labelProps={{ fontFamily: 'Futura-Pt-Book', textAnchor: 'middle' }}
          labelOffset={20}
          top={graphHeight - bottomAxisHeight}
          left={leftAxisWidth}
          numTicks={10}
          tickComponent={(props) => (
            <Text {...props} fontFamily="Futura-Pt-Book">
              {props.formattedValue}
            </Text>
          )}
          hideZero
        />
      </svg>
      {tooltipOpen &&
        typeof tooltipData === 'number' &&
        tooltipLeft != null &&
        tooltipTop != null && (
          <Tooltip
            offsetLeft={0}
            offsetTop={0}
            left={tooltipLeft}
            top={tooltipTop}
            style={{
              backgroundColor: '#f7d186',
              border: '2px solid #c8ab74',
              boxShadow: 'rgb(33 33 33 / 20%) 0px 1px 2px',
              padding: '0.3rem 0.5rem',
              borderRadius: 10,
              pointerEvents: 'auto',
            }}
            applyPositionStyle
          >
            <GraphTooltip
              listing={listings[tooltipData]}
              onBuyClick={() => console.log('buy clicked')}
            />
          </Tooltip>
        )}
    </>
  );
};
GraphContent.defaultProps = defaultGraphContentProps;
const GraphWithParent = withParentSize(GraphContent);

export default function Graph() {
  const graphStyle = {
    borderRadius: '25px',
    fontFamily: 'Futura-Pt-Book',
    backgroundColor: colorTheme.module.foreground,
  };

  return (
    <Box style={graphStyle}>
      <GraphWithParent />
    </Box>
  );
}
