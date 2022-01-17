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
import { Zoom, applyMatrixToPoint } from '@visx/zoom';
import { TransformMatrix } from '@visx/zoom/lib/types';

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
// Uses log-scale stretching to give relative scale among large maxPlotSize values
const calculateCircleRadius = (
  plotSize: number,
  maxPlotSize: number
): number => {
  const logPlotSize = Math.log(plotSize) > 0 ? Math.log(plotSize) : 0;
  const ratio = logPlotSize / Math.log(maxPlotSize);
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

const rescaleYWithZoom = (scale, zoom) => {
  const newDomain = scale.range().map((r) => scale.invert(
    (r - zoom.transformMatrix.translateY) / zoom.transformMatrix.scaleY
  ));
  return scale.copy().domain(newDomain);
};

const rescaleXWithZoom = (scale, zoom) => {
  const newDomain = scale.range().map((r) => scale.invert(
    (r - zoom.transformMatrix.translateX) / zoom.transformMatrix.scaleX
  ));
  return scale.copy().domain(newDomain);
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

  const { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const maxPlaceInLine = Math.max(
    ...listings.map((l) => l.objectiveIndex.minus(harvestableIndex).toNumber())
  );
  const maxPlotSize = Math.max(
    ...listings.map((l) => l.initialAmount.minus(l.amountSold).toNumber())
  );

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
    // x position is current place in line
    x: xScale(listing.objectiveIndex.minus(harvestableIndex).toNumber()) + leftAxisWidth,
    // y position is price per pod
    y: yScale(listing.pricePerPod.toNumber()),
    // radius is plot size
    radius: calculateCircleRadius(
      listing.initialAmount.minus(listing.amountSold).toNumber(),
      maxPlotSize
    ),
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

  // This works to constrain at x=0 y=0 but it causes some weird
  // mouse and zoom behavior.
  // https://airbnb.io/visx/docs/zoom#Zoom_constrain
  const constrain = (transformMatrix: TransformMatrix, prevTransformMatrix: TransformMatrix) => {
    const min = applyMatrixToPoint(transformMatrix, { x: 0, y: 0 });
    if (min.x > 0 || min.y < 0) {
      return prevTransformMatrix;
    }
    return transformMatrix;
  };

  return (
    <>
      <Zoom<SVGSVGElement>
        width={parentWidth}
        height={graphHeight}
        constrain={constrain}
        scaleXMin={1 / 2}
        scaleXMax={4}
        scaleYMin={1 / 2}
        scaleYMax={4}
      >
        {(zoom) => (
          <div style={{ position: 'relative' }}>
            <svg
              width={parentWidth}
              height={graphHeight}
              ref={zoom.containerRef}
              style={{
                cursor: zoom.isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
            >
              {/* Contains the entire chart (incl. axes and labels)
                  QUESTION: why have this + the below <rect> both take up the full dims? */}
              <rect
                width={parentWidth}
                height={graphHeight}
                fill="transparent"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
              />
              <g transform={zoom.toString()}>{circles}</g>
              {/* Contains the chart; this seems to be sitting over top of the other elems */}
              <rect
                width={parentWidth}
                height={graphHeight}
                fill="transparent"
                ref={svgRef}
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={(evt) => {
                  zoom.dragMove(evt); // handle zoom drag
                  handleMouseMove(evt, svgRef); // handle hover event for tooltips
                }}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                onDoubleClick={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                }}
              />
              {/* Y axis: Price per Pod */}
              <AxisLeft
                scale={rescaleYWithZoom(yScale, zoom)}
                tickFormat={(d) => `$${d.toFixed(2)}`}
                label="Price Per Pod"
                labelProps={{
                  fontFamily: 'Futura-Pt-Book',
                  textAnchor: 'middle',
                }}
                left={leftAxisWidth}
                labelOffset={40}
                numTicks={10}
                tickComponent={(props) => {
                  const { formattedValue, ...renderProps } = props;
                  return (
                    <Text {...renderProps} fontFamily="Futura-Pt-Book">
                      {formattedValue}
                    </Text>
                  );
                }}
                hideZero
              />
              {/* X axis: Place in Line */}
              <AxisBottom
                scale={rescaleXWithZoom(xScale, zoom)}
                tickFormat={(d) => `${d / 1e6}M`}
                label="Place In Line"
                labelProps={{
                  fontFamily: 'Futura-Pt-Book',
                  textAnchor: 'middle',
                }}
                labelOffset={20}
                top={graphHeight - bottomAxisHeight}
                left={leftAxisWidth}
                numTicks={10}
                tickComponent={(props) => {
                  const { formattedValue, ...renderProps } = props;
                  return (
                    <Text {...renderProps} fontFamily="Futura-Pt-Book">
                      {formattedValue}
                    </Text>
                  );
                }}
                hideZero
              />
            </svg>
            {/* Tooltip Display */}
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
                    harvestableIndex={harvestableIndex}
                  />
                </Tooltip>
              )}
          </div>
        )}
      </Zoom>
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
    marginTop: 20,
  };

  return (
    <Box style={graphStyle}>
      <GraphWithParent />
    </Box>
  );
}
