import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardProps, IconButton, Stack, Typography } from '@mui/material';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import { Circle, Line } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { RectClipPath } from '@visx/clip-path';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { PatternLines } from '@visx/pattern';
import { Zoom, applyMatrixToPoint } from '@visx/zoom';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { voronoi, VoronoiPolygon } from '@visx/voronoi';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from '@mui/styles';
import BigNumber from 'bignumber.js';
import { PodListing, PodOrder } from '~/state/farmer/market';
import { BeanstalkPalette, FontSize } from '~/components/App/muiTheme';
import EntityIcon from '~/components/Market/EntityIcon';
import { displayBN, displayFullBN } from '~/util';
import Row from '~/components/Common/Row';
import StatHorizontal from '~/components/Common/StatHorizontal';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, PODS } from '~/constants/tokens';

const useStyles = makeStyles({
  relative: {
    position: 'relative'
  },
  listingBox: {
    backgroundColor: '#b3cde3',
    border: '1px solid #333',
    boxShadow: 'rgb(33 33 33 / 20%) 0px 1px 2px',
    padding: '0.3rem 0.5rem',
    borderRadius: 10,
    pointerEvents: 'auto',
    zIndex: 99999,
  },
  orderBox: {
    backgroundColor: '#ccebc5',
    border: '2px solid #333',
    boxShadow: 'rgb(33 33 33 / 20%) 0px 1px 2px',
    padding: '0.3rem 0.5rem',
    borderRadius: 10,
    pointerEvents: 'auto',
    zIndex: 99999,
  },
});

/// //////////////////////////////// TYPES ///////////////////////////////////

type CirclePosition = {
  x: number;
  y: number;
  radius: number;
  id: string;
};

type TooltipData = {
  type: 'listing' | 'order';
  index: number;
  coordinate: CirclePosition
}

export type MarketGraphProps = {
  listings: PodListing[];
  orders: PodOrder[];
  maxPlaceInLine: number;
  maxPlotSize: number;
  harvestableIndex: BigNumber;
}

type GraphProps = {
  width: number;
  height: number;
} & MarketGraphProps;

/// //////////////////////////////// STYLE & LAYOUT ///////////////////////////////////

const PATTERN_ID = 'brush_pattern';
export const accentColor = '#f6acc8';
export const background = '#584153';
export const background2 = '#af8baf';

const tooltipWidth = 100;
const scaleXMin = 1;
const scaleXMax = 8;
const scaleYMin = 1;
const scaleYMax = 8;

const margin = {
  top: 10,
  left: 0,
  right: 0,
  bottom: 0,
};
const axis = {
  xHeight: 28,
  yWidth:  45,
};
const neighborRadius = 75;

/// //////////////////////////////// STYLE & LAYOUT ///////////////////////////////////

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

/// //////////////////////////////// SCALING ///////////////////////////////////

const rescaleYWithZoom = (scale: any, zoom: any) => {
  const newDomain = scale.range().map((r: any) => scale.invert(
    (r - zoom.transformMatrix.translateY) / zoom.transformMatrix.scaleY
  ));
  return scale.copy().domain(newDomain);
};

const rescaleXWithZoom = (scale: any, zoom: any) => {
  const newDomain = scale.range().map((r: any) => scale.invert(
    (r - zoom.transformMatrix.translateX) / zoom.transformMatrix.scaleX
  ));
  return scale.copy().domain(newDomain);
};

/// //////////////////////////////// COMPONENTS ///////////////////////////////////

const TooltipCard : React.FC<CardProps> = ({ children, sx, ...props }) => (
  <Card sx={{ backgroundColor: BeanstalkPalette.lightestBlue, px: 0.5, py: 0.5, ...sx }} {...props}>
    {children}
  </Card>
);

const SelectedPointPopover : React.FC<{ selectedPoint: TooltipData; listings: PodListing[]; orders: PodOrder[]; }> = ({ selectedPoint, listings, orders }) => {
  let inner;
  if (selectedPoint.type === 'listing') {
    const data = listings[selectedPoint.index];
    inner = (
      <Stack gap={1}>
        <Row gap={1} justifyContent="space-between">
          <Typography variant="h4">Pod Listing</Typography>
          <IconButton
            disableRipple
            sx={{
              color: (theme) => theme.palette.grey[600],
              p: 0
            }}
          >
            <CloseIcon sx={{ fontSize: FontSize.base }} />
          </IconButton>
        </Row>
        <StatHorizontal label="Place in Line">
          {displayBN(data.placeInLine)}
        </StatHorizontal>
        <StatHorizontal label="Price per Pod">
          <Row gap={0.25}><TokenIcon token={BEAN[1]} /> {displayFullBN(data.pricePerPod, 4, 2)}</Row>
        </StatHorizontal>
        <StatHorizontal label="# of Pods Listed">
          <Row gap={0.25}><TokenIcon token={PODS} /> {displayFullBN(data.remainingAmount, 2, 0)}</Row>
        </StatHorizontal>
        <Button variant="contained" color="primary">
          Buy
        </Button>
      </Stack>
    );
  }

  // backgroundColor: 'white', p: 0.5, borderRadius: 1
  return (
    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
      <TooltipCard sx={{ px: 1, py: 1, minWidth: 260, boxShadow: '0 4px 20px 6px rgba(255,255,255,0.6)' }}>
        {inner}
      </TooltipCard>
    </Box>
  );
};

/// //////////////////////////////// GRAPH ///////////////////////////////////

const Graph: React.FC<GraphProps> = ({
  height,
  width,
  listings,
  orders,
  maxPlaceInLine,
  maxPlotSize,
}) => {
  const classes = useStyles();

  ///
  const innerWidth  = width -  (margin.left + margin.right);
  const innerHeight = height - (margin.top  + margin.bottom);
  const svgRef = useRef<SVGSVGElement>(null);
  
  /// Tooltip
  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    hideTooltip,
    showTooltip,
    tooltipData,
  } = useTooltip<TooltipData>();

  /// Scales
  const xScale = scaleLinear<number>({
    domain: [
      0,
      Math.max(maxPlaceInLine * 1.1)
    ],
    range: [
      0,                          //
      innerWidth - axis.yWidth    //
    ],
  });
  const yScale = scaleLinear<number>({
    domain: [
      0,
      1
    ],
    range: [
      height - axis.xHeight,      //
      margin.top                  //
    ],
  });

  /// Position data
  const orderPositions : CirclePosition[] = useMemo(() => 
    orders.map((order) => ({
      id: order.id,
      // x position is current place in line
      x: xScale(new BigNumber(order.maxPlaceInLine).toNumber()) + axis.yWidth,
      // y position is price per pod
      y: yScale(order.pricePerPod.toNumber()),
      // radius is plot size
      radius: 4,
    })),
    [orders, xScale, yScale]
  );
  const listingPositions : CirclePosition[] = useMemo(() => 
    listings.map((listing) => ({
      id: listing.id,
      // x position is current place in line
      x: xScale(listing.placeInLine.toNumber()) + axis.yWidth,
      // y position is price per pod
      y: yScale(listing.pricePerPod.toNumber()),
      // radius is plot size
      radius: calculateCircleRadius(
        listing.amount.toNumber(),
        maxPlotSize
      ),
    })),
    [listings, maxPlotSize, xScale, yScale]
  );

  /// Voronoi
  const combinedPositions : CirclePosition[] = useMemo(() => 
    [...listingPositions, ...orderPositions],
    [listingPositions, orderPositions]
  );
  const voronoiLayout = useMemo(
    () =>
      voronoi<CirclePosition>({
        x: (d) => d.x,
        y: (d) => d.y,
        width: innerWidth,
        height: innerHeight,
      })(combinedPositions),
    [innerWidth, innerHeight, combinedPositions],
  );
  const polygons = voronoiLayout.polygons();
  const [selectedPoint, setSelectedPoint] = useState<TooltipData | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [neighborIds, setNeighborIds] = useState<Set<string>>(new Set());
  
  /// Elements
  const orderCircles = orderPositions.map((coordinate, i) => {
    const active = tooltipData?.type === 'order' && i === tooltipData?.index;
    return (
      <Circle
        key={`order-${i}`}
        cx={coordinate.x}
        cy={coordinate.y}
        r={active ? 1.5 * coordinate.radius : coordinate.radius}
        opacity={
          !tooltipData?.type 
            ? 1 
            : tooltipData.type === 'order' 
              ? (tooltipData.index === i ? 1 : 0.2)
              : 0.2
        }
        fill={BeanstalkPalette.logoGreen}
        stroke={active ? BeanstalkPalette.mediumGreen : '#fff'}
        strokeWidth={active ? 2 : 1}
        cursor="pointer"
      />
    );
  });
  const listingCircles = listingPositions.map((coordinate, i) => {
    const active = tooltipData?.type === 'listing' && i === tooltipData?.index;
    return (
      <Circle
        key={`listing-${i}`}
        cx={coordinate.x}
        cy={coordinate.y}
        r={active ? 1.5 * coordinate.radius : coordinate.radius}
        opacity={
          !tooltipData?.type 
            ? 1 
            : tooltipData.type === 'listing' 
              ? (tooltipData.index === i ? 1 : 0.2)
              : 0.2
        }
        fill={BeanstalkPalette.mediumRed}
        stroke={active ? BeanstalkPalette.trueRed : '#fff'}
        strokeWidth={active ? 2 : 1}
        cursor="pointer"
      />
    );
  });

  /// Handlers
  const handleMouseMove = useCallback((event: React.MouseEvent | React.TouchEvent, zoom: ProvidedZoom<SVGSVGElement>) => {
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

    /// Voronoi
    const closest = voronoiLayout.find(transformedPoint.x, transformedPoint.y, neighborRadius);

    // find neighboring polygons to hightlight
    if (closest && closest.data.id !== hoveredId) {
      const neighbors = new Set<string>();
      const cell = voronoiLayout.cells[closest.index];
      if (!cell) return;

      cell.halfedges.forEach((index) => {
        const edge = voronoiLayout.edges[index];
        const { left, right } = edge;
        if (left && left !== closest) neighbors.add(left.data.id);
        else if (right && right !== closest) neighbors.add(right.data.id);
      });

      setNeighborIds(neighbors);
      setHoveredId(closest.data.id);
    }

    ///
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
        tooltipLeft: zoomedCoordinate.x,// + coordinate.radius / Math.sqrt(2) - 100, // 200 = width of tooltip
        tooltipTop:  zoomedCoordinate.y,// + coordinate.radius / Math.sqrt(2) - 0,
        tooltipData: {
          index: listingIndex,
          type: 'listing',
          coordinate: coordinate
        }
      });
    } else {
      const orderIndex = findPointInCircles(orderPositions, transformedPoint);
      // const orderIndex = findPointInLines(orderPositions, transformedPoint);
      if (orderIndex !== undefined) {
        // Get the original position of the circle (no zoom)
        const coordinate = orderPositions[orderIndex];

        const zoomedCoordinate = zoom.applyToPoint({
          x: coordinate.x,
          y: coordinate.y,
        });

        // Show tooltip at bottom-right corner of circle position.
        // Nudge inward to make hovering easier.
        showTooltip({
          tooltipLeft: zoomedCoordinate.x,        // -90 centers tooltip on mouse
          tooltipTop: zoomedCoordinate.y,   // locks to the same y-position regardless of mouse
          tooltipData: {
            index: orderIndex,
            type: 'order',
            coordinate: coordinate
          }
        });
      } else {
        hideTooltip();
      }
    }
  }, [hideTooltip, hoveredId, listingPositions, orderPositions, showTooltip, voronoiLayout]);
  
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
      x: width,
      y: height
    });
    if (max.x < width) {
      transformMatrix.translateX = translateX + Math.abs(max.x - width);
    }
    if (max.y < height) {
      transformMatrix.translateY = translateY + Math.abs(max.y - height);
    }
    // Return the matrix
    return transformMatrix;
  };

  return (
    <>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        constrain={constrain}
        scaleXMin={scaleXMin}
        scaleXMax={scaleXMax}
        scaleYMin={scaleYMin}
        scaleYMax={scaleYMax}
      >
        {(zoom) => (
          <div className={classes.relative}>
            <svg
              width={width}
              height={height}
              ref={zoom.containerRef}
            >
              <RectClipPath
                id="zoom-clip"
                width={width - axis.yWidth}
                height={height - axis.xHeight}
                x={axis.yWidth}
                y={0}
              />
              <g clipPath="url(#zoom-clip)">
                <g transform={zoom.toString()}>
                  <PatternLines
                    id={PATTERN_ID}
                    height={5}
                    width={5}
                    stroke={BeanstalkPalette.logoGreen}
                    strokeWidth={1}
                    orientation={['diagonal']}
                  />
                  <g>
                    {polygons.map((polygon) => (
                      <VoronoiPolygon
                        key={`polygon-${polygon.data.id}`}
                        polygon={polygon}
                        fill={
                          hoveredId && (polygon.data.id === hoveredId || neighborIds.has(polygon.data.id))
                            ? 'red'
                            : 'transparent'
                        }
                        fillOpacity={hoveredId && neighborIds.has(polygon.data.id) ? 0.05 : 0.2}
                        strokeLinejoin="round"
                      />
                    ))}
                  </g>
                  {(tooltipOpen && tooltipData)
                    ? tooltipData?.type === 'listing'
                      ? (
                        <>
                          <Line
                            from={{ x: 0, y: tooltipData.coordinate.y }}
                            to={{   x: tooltipData.coordinate.x, y: tooltipData.coordinate.y }}
                            stroke={BeanstalkPalette.lightGrey}
                            strokeWidth={1}
                            pointerEvents="none"
                          />
                          <Line
                            from={{ x: tooltipData.coordinate.x, y: innerHeight }}
                            to={{   x: tooltipData.coordinate.x, y: tooltipData.coordinate.y }}
                            stroke={BeanstalkPalette.lightGrey}
                            strokeWidth={1}
                            pointerEvents="none"
                          />
                          <Text fill="black" x={tooltipData.coordinate.x + 10} y={innerHeight - axis.xHeight} fontSize={14}>
                            {displayBN(listings[tooltipData.index].placeInLine)}
                          </Text>
                          <Text fill="black" x={axis.yWidth + 10} y={tooltipData.coordinate.y - 5} fontSize={14}>
                            {listings[tooltipData.index].pricePerPod.toFixed(4)}
                          </Text>
                        </>
                      )
                      : (
                        <>
                          <Line
                            from={{ x: 0, y: tooltipData.coordinate.y }}
                            to={{   x: tooltipData.coordinate.x, y: tooltipData.coordinate.y }}
                            stroke={BeanstalkPalette.lightGrey}
                            strokeWidth={1}
                            pointerEvents="none"
                          />
                          <Line
                            from={{ x: tooltipData.coordinate.x, y: innerHeight }}
                            to={{   x: tooltipData.coordinate.x, y: tooltipData.coordinate.y }}
                            stroke={BeanstalkPalette.lightGrey}
                            strokeWidth={1}
                            pointerEvents="none"
                          />
                          <rect
                            fill={`url(#${PATTERN_ID})`}
                            x={0}
                            y={tooltipData.coordinate.y}
                            height={innerHeight - tooltipData.coordinate.y}
                            width={tooltipData.coordinate.x}
                          />
                          <Text fill="black" x={tooltipData.coordinate.x + 10} y={innerHeight - axis.xHeight} fontSize={14}>
                            {displayBN(orders[tooltipData.index].maxPlaceInLine)}
                          </Text>
                          <Text fill="black" x={axis.yWidth + 10} y={tooltipData.coordinate.y - 5} fontSize={14}>
                            {orders[tooltipData.index].pricePerPod.toFixed(4)}
                          </Text>
                        </>
                      )
                    : null}
                  {orderCircles}
                  {listingCircles}
                </g>
              </g>
              <rect
                width={width - axis.yWidth}
                height={height - axis.xHeight}
                x={axis.yWidth}
                y={0}
                fill="transparent"
                ref={svgRef}
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onClick={() => { setSelectedPoint(tooltipData); }}
                onMouseMove={(evt) => {
                  zoom.dragMove(evt); // handle zoom drag
                  handleMouseMove(evt, zoom); // handle hover event for tooltips
                }}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                style={{
                  cursor: (
                    zoom.isDragging
                      ? 'grabbing' 
                      : tooltipData
                        ? 'pointer'
                        : 'grab'
                  ),
                  touchAction: 'none',
                }}
              />
              <AxisLeft
                scale={rescaleYWithZoom(yScale, zoom)}
                left={axis.yWidth}
                numTicks={10}
                tickFormat={(d) => `$${d.toFixed(2)}`}
                tickComponent={(props) => {
                  const { formattedValue, ...renderProps } = props;
                  return (
                    <Text {...renderProps} fontFamily="Futura PT">
                      {formattedValue}
                    </Text>
                  );
                }}
                hideZero
              />
              {/* X axis: Place in Line */}
              <AxisBottom
                scale={rescaleXWithZoom(xScale, zoom)}
                top={height - axis.xHeight}
                left={axis.yWidth}
                numTicks={10}
                tickComponent={(props) => {
                  const { formattedValue, ...renderProps } = props;
                  return (
                    <Text {...renderProps} fontFamily="Futura PT" height={200}>
                      {formattedValue}
                    </Text>
                  );
                }}
                tickFormat={(d: number) => {
                  if (d < 1e6) return `${d / 1e3}k`;
                  return `${d / 1e6}M`;
                }}
                hideZero
              />
            </svg>
            {tooltipOpen &&
              typeof tooltipData === 'object' &&
              tooltipData != null &&
              tooltipLeft != null &&
              tooltipTop != null && (
                <Tooltip
                  offsetLeft={10}
                  offsetTop={-70}
                  left={tooltipLeft}
                  top={tooltipTop}
                  width={tooltipWidth}
                  applyPositionStyle
                  style={{
                    // This needs to stay as `style` for override purposes
                    padding: 0,
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    fontSize: 13,
                  }}
                >
                  <TooltipCard>
                    <Row gap={0.5}>
                      <EntityIcon type={tooltipData.type} size={20} />
                      {tooltipData.type === 'listing' 
                        ? displayBN(listings[tooltipData.index].remainingAmount) 
                        : displayBN(orders[tooltipData.index].remainingAmount)
                      } Pods
                    </Row>
                    <Typography display="block" variant="bodySmall" color="gray" textAlign="left" mt={0.25}>
                      Click to view
                    </Typography>
                  </TooltipCard>
                </Tooltip>
            )}
            {selectedPoint && (
              <SelectedPointPopover
                selectedPoint={selectedPoint}
                orders={orders}
                listings={listings}
              />
            )}
          </div>
        )}
      </Zoom>
    </>
  );
};

/// //////////////////////////////// WRAPPER ///////////////////////////////////

const MarketGraph: React.FC<MarketGraphProps> = (props) => (
  <ParentSize debounceTime={50}>
    {({ width: visWidth, height: visHeight }) => (
      <Graph
        width={visWidth}
        height={visHeight}
        {...props}
      >
        {props.children}
      </Graph>
    )}
  </ParentSize>
);

export default MarketGraph;
