import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import { Circle, Bar } from '@visx/shape';
import { withParentSize } from '@visx/responsive';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { PatternLines } from '@visx/pattern';
import { Zoom, applyMatrixToPoint } from '@visx/zoom';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import minBy from 'lodash/minBy';

import { theme as colorTheme } from 'constants/index';
import { AppState } from 'state';
import { makeStyles } from '@mui/styles';
import { GraphListingTooltip, GraphOrderTooltip } from './GraphTooltips';

const useStyles = makeStyles({
  positionRelative: {
    position: 'relative'
  },
  tooltip: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    paddingTop: 7,
  },
  listingBox: {
    backgroundColor: '#b3cde3',
    border: '2px solid #333',
    boxShadow: 'rgb(33 33 33 / 20%) 0px 1px 2px',
    padding: '0.3rem 0.5rem',
    borderRadius: 10,
    pointerEvents: 'auto',
    zIndex: 99999,
  },
  nonListingBox: {
    backgroundColor: '#ccebc5',
    border: '2px solid #333',
    boxShadow: 'rgb(33 33 33 / 20%) 0px 1px 2px',
    padding: '0.3rem 0.5rem',
    borderRadius: 10,
    pointerEvents: 'auto',
    zIndex: 99999,
  },
  graphStyle: {
    borderRadius: '25px',
    fontFamily: 'Futura-Pt-Book',
    backgroundColor: colorTheme.module.foreground,
    marginTop: 20,
  }
});

type CirclePosition = {
  x: number;
  y: number;
  radius: number;
};

type LinePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TooltipData = {
  type: 'listing' | 'order';
  index: number;
}

const PATTERN_ID = 'brush_pattern';
export const accentColor = '#f6acc8';
export const background = '#584153';
export const background2 = '#af8baf';

// Calculates a circle radius between MIN_RADIUS and MAX_RADIUS based on the given plotSize
// Uses log-scale stretching to give relative scale among large maxPlotSize values
const MIN_RADIUS = 2;
const MAX_RADIUS = 6;
const calculateCircleRadius = (
  plotSize: number,
  maxPlotSize: number
): number => {
  const logPlotSize = Math.log(plotSize) > 0 ? Math.log(plotSize) : 0;
  const ratio = logPlotSize / Math.log(maxPlotSize);
  return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * ratio;
};

// Calculates a line height between MIN_HEIGHT and MAX_HEIGHT based on the given plotSize
// Uses log-scale stretching to give relative scale among large maxPlotSize values
const MIN_HEIGHT = 2;
const MAX_HEIGHT = 6;
const calculateLineHeight = (
  plotSize: number,
  maxPlotSize: number
): number => {
  const logPlotSize = Math.log(plotSize) > 0 ? Math.log(plotSize) : 0;
  const ratio = logPlotSize / Math.log(maxPlotSize);
  return MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * ratio;
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

// Returns the index of the element within positions that the given point is within.
// Returns undefined if point is not within any position.
const findPointInLines = (
  positions: LinePosition[],
  point: { x: number; y: number }
): number | undefined => {
  const foundPositions: number[] = [];
  for (let i = 0; i < positions.length; i += 1) {
    const position = positions[i];
    if (
      point.x >= position.x &&
      point.x <= position.x + position.width &&
      point.y >= position.y - (position.height / 2) &&
      point.y <= position.y + (position.height / 2)
    ) {
      foundPositions.push(i);
    }
  }

  // In case point is within multiple positions, choose the one with the smallest height
  return minBy(foundPositions, (index) => positions[index].height);
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

// ---

interface GraphContentProps {
  parentWidth?: number;
  setCurrentListing: Function;
  setCurrentOrder: Function;
}
const defaultGraphContentProps = {
  parentWidth: undefined,
};

const GraphContent = ({ parentWidth, setCurrentListing, setCurrentOrder }: GraphContentProps) => {
  const classes = useStyles();
  const graphHeight = 350;
  const leftAxisWidth = 70;
  const bottomAxisHeight = 50;
  // Amount of top vertical padding in between graph content and graph container
  const topVerticalPadding = 20;
  // Amount of right horizontal padding in between graph content and graph container
  const rightHorizontalPadding = 20;

  const { orders } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  let { listings } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  listings = listings.filter((l) => l.maxHarvestableIndex.isGreaterThan(harvestableIndex));

  const maxPlaceInLine = Math.max(
    ...listings.map((l) => l.index.minus(harvestableIndex).toNumber())
  );
  const maxPlotSize = Math.max(
    ...listings.map((l) => l.totalAmount.minus(l.filledAmount).toNumber())
  );

  // Set max x value to be 1M or max place in line with some buffer
  const xDomain = [0, Math.max(maxPlaceInLine * 1.1)];
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
  } = useTooltip<TooltipData>();

  if (parentWidth === undefined) return null;

  const xScale = scaleLinear<number>({
    domain: xDomain,
    range: [0, parentWidth - leftAxisWidth - rightHorizontalPadding],
  });

  const yScale = scaleLinear<number>({
    domain: yDomain,
    range: [graphHeight - bottomAxisHeight, topVerticalPadding],
  });

  // -- Orders

  const orderPositions : LinePosition[] = orders.map((order) => {
    const y = yScale(order.pricePerPod.toNumber());
    const h = calculateLineHeight(
      order.remainingAmount.toNumber(),
      maxPlotSize
    );
    const w = xScale(order.maxPlaceInLine.toNumber());
    return {
      x: leftAxisWidth,
      y: y - h / 2,
      height: h,
      width: w,
    };
  });

  const orderLines = orderPositions.map((coordinate, i) => {
    const active = tooltipData?.type === 'order' && i === tooltipData?.index;
    return (
      <Bar
        x={coordinate.x}
        y={coordinate.y}
        height={coordinate.height}
        width={coordinate.width}
        fill={`url('#${PATTERN_ID}')`}
        stroke={active ? '#000' : '#888'}
        strokeWidth={active ? 1.5 : 1}
      />
    );
  });

  // -- Listings

  const listingPositions : CirclePosition[] = listings.map((listing) => ({
    // x position is current place in line
    x: xScale(listing.index.minus(harvestableIndex).toNumber()) + leftAxisWidth,
    // y position is price per pod
    y: yScale(listing.pricePerPod.toNumber()),
    // radius is plot size
    radius: calculateCircleRadius(
      listing.totalAmount.minus(listing.filledAmount).toNumber(),
      maxPlotSize
    ),
  }));

  const listingCircles = listingPositions.map((coordinate, i) => {
    const active = tooltipData?.type === 'listing' && i === tooltipData?.index;
    return (
      <Circle
        pointerEvents="none"
        key={`point-${i}`}
        cx={coordinate.x}
        cy={coordinate.y}
        r={coordinate.radius}
        fill="#b3cde3"
        stroke={active ? '#000' : '#888'}
        strokeWidth={active ? 2 : 1}
      />
    );
  });

  const handleMouseMove = (event: React.MouseEvent | React.TouchEvent, zoom: ProvidedZoom<SVGSVGElement>) => {
    if (!svgRef.current) return;

    // This is the mouse position with respect to the 
    // svg element, which doesn't change size.
    const point = localPoint(svgRef.current, event);
    if (!point) return;

    // We use the current zoom to transform the current mouse coordinates
    // into their "actual" position based on the zoom settings. For example,
    // when zoomed all the way out the top left corner of the graph is (0, 0),
    // but at higher zoom levels it will be some other non-zero value. This ensures
    // that we can hover over circles correctly even when zoomed in.
    const transformedPoint = zoom.applyInverseToPoint(point);

    const listingIndex = findPointInCircles(listingPositions, transformedPoint);
    if (listingIndex !== undefined) {
      // Get the original position of the circle (no zoom)
      // FIXME: rename this position? used word interchangably.
      // position makes more sense for the line.
      const coordinate = listingPositions[listingIndex];

      // Apply our current zoom settings to the original position.
      // This makes sure the tooltip appears in the right spot even
      // if you zoom/pan around.
      const zoomedCoordinate = zoom.applyToPoint(coordinate);

      // Show tooltip at bottom-right corner of circle position.
      // Nudge inward to make hovering easier.
      showTooltip({
        tooltipLeft: zoomedCoordinate.x + coordinate.radius / Math.sqrt(2) - 100, // 200 = width of tooltip
        tooltipTop: zoomedCoordinate.y + coordinate.radius / Math.sqrt(2) - 0,
        tooltipData: {
          index: listingIndex,
          type: 'listing',
        }
      });
    } else {
      const orderIndex = findPointInLines(orderPositions, transformedPoint);
      if (orderIndex !== undefined) {
        // Get the original position of the circle (no zoom)
        const position = orderPositions[orderIndex];

        const zoomedCoordinate = zoom.applyToPoint({
          x: position.x,
          y: position.y,
        });

        // Show tooltip at bottom-right corner of circle position.
        // Nudge inward to make hovering easier.
        showTooltip({
          tooltipLeft: point.x - 90,        // -90 centers tooltip on mouse
          tooltipTop: zoomedCoordinate.y,   // locks to the same y-position regardless of mouse
          tooltipData: {
            index: orderIndex,
            type: 'order',
          }
        });
      } else {
        hideTooltip();
      }
    }
  };

  const scaleXMin = 1;
  const scaleXMax = 4;
  const scaleYMin = 1;
  const scaleYMax = 4;
  
  // This works to constrain at x=0 y=0 but it causes some weird
  // mouse and zoom behavior.
  // https://airbnb.io/visx/docs/zoom#Zoom_constrain
  const constrain = (
    transformMatrix: TransformMatrix,
    // prevTransformMatrix: TransformMatrix
  ) => {
    const { scaleX, scaleY, translateX, translateY } = transformMatrix;
    // Fix constrain scale
    // if (scaleX < 1) transformMatrix.scaleX = 1;
    // if (scaleY < 1) transformMatrix.scaleY = 1;
    if (scaleX < scaleXMin) transformMatrix.scaleX = scaleXMin;
    else if (scaleX > scaleXMax) transformMatrix.scaleX = scaleXMax;
    if (scaleY < scaleYMin) transformMatrix.scaleY = scaleYMin;
    else if (scaleY > scaleYMax) transformMatrix.scaleY = scaleYMax;

    // Fix constrain translate [left, top] position
    if (translateX > 0) transformMatrix.translateX = 0;
    if (translateY > 0) transformMatrix.translateY = 0;
    // Fix constrain translate [right, bottom] position
    const max = applyMatrixToPoint(transformMatrix, {
      x: parentWidth,
      y: graphHeight
    });
    if (max.x < parentWidth) {
      transformMatrix.translateX = translateX + Math.abs(max.x - parentWidth);
    }
    if (max.y < graphHeight) {
      transformMatrix.translateY = translateY + Math.abs(max.y - graphHeight);
    }
    // Return the matrix
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
          <div className={classes.positionRelative}>
            <svg
              width={parentWidth}
              height={graphHeight}
              ref={zoom.containerRef}
              style={{
                cursor: zoom.isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
            >
              <g transform={zoom.toString()}>
                <PatternLines
                  id={PATTERN_ID}
                  height={5}
                  width={5}
                  stroke="green"
                  strokeWidth={1}
                  orientation={['diagonal']}
                />
                {orderLines}
              </g>
              <g transform={zoom.toString()}>
                {listingCircles}
              </g>
              {/* Contains the entire chart (incl. axes and labels)
                  QUESTION: why have this + the below <rect> both take up the full dims? */}
              <rect
                width={parentWidth}
                height={graphHeight}
                fill="transparent"
              />
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
                  handleMouseMove(evt, zoom); // handle hover event for tooltips
                }}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                // onDoubleClick={(event) => {
                  // const point = localPoint(event) || { x: 0, y: 0 };
                  // zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                // }}
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
                tickFormat={(d: number) => {
                  if (d < 1e6) return `${d / 1e3}k`;
                  return `${d / 1e6}M`;
                }}
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
              typeof tooltipData === 'object' &&
              tooltipData != null &&
              tooltipLeft != null &&
              tooltipTop != null && (
                <Tooltip
                  offsetLeft={0}
                  offsetTop={0}
                  left={tooltipLeft}
                  top={tooltipTop}
                  applyPositionStyle
                  className={classes.tooltip}
                >
                  <Box
                    className={tooltipData.type === 'listing' ? classes.listingBox : classes.nonListingBox}>
                    {tooltipData.type === 'listing' ? (
                      <GraphListingTooltip
                        listing={listings[tooltipData.index]}
                        onTransact={() => {
                          hideTooltip();
                          setCurrentListing(listings[tooltipData.index]);
                        }}
                        harvestableIndex={harvestableIndex}
                      />
                    ) : (
                      <GraphOrderTooltip
                        order={orders[tooltipData.index]}
                        onTransact={() => {
                          hideTooltip();
                          setCurrentOrder(orders[tooltipData.index]);
                        }}
                      />
                    )}
                  </Box>
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

// --
type GraphModuleProps = {
  setCurrentListing: Function;
  setCurrentOrder: Function;
}
export default function GraphModule(props: GraphModuleProps) {
  const classes = useStyles();
  return (
    <Box className={classes.graphStyle}>
      <GraphWithParent
        setCurrentListing={props.setCurrentListing}
        setCurrentOrder={props.setCurrentOrder}
      />
    </Box>
  );
}
