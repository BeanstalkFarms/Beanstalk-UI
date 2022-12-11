import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Box, Card, CardProps } from '@mui/material';
import { Tooltip, useTooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import { Circle, Line } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { RectClipPath } from '@visx/clip-path';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { PatternLines } from '@visx/pattern';
import { applyMatrixToPoint, Zoom } from '@visx/zoom';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { voronoi, VoronoiPolygon } from '@visx/voronoi';
import BigNumber from 'bignumber.js';
import { useNavigate } from 'react-router-dom';
import { PodListing, PodOrder } from '~/state/farmer/market';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import EntityIcon from '~/components/Market/Pods/EntityIcon';
import { displayBN } from '~/util';
import Row from '~/components/Common/Row';
import { FC } from '~/types';
import './MarketGraph.css';
import { MARKET_SLUGS } from '~/components/Market/PodsV2/MarketActionsV2';
import { useAtom } from 'jotai';
import {
  PodOrderAction,
  PodOrderType,
  podsOrderActionTypeAtom,
  podsOrderTypeAtom
} from '~/components/Market/PodsV2/info/atom-context';

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
const axisColor      = BeanstalkPalette.theme.winter.lightGreen;
const tickLabelColor = BeanstalkPalette.theme.winter.lightGreen;
const tickLabelProps = (type: 'x' | 'y') => () => ({
  fill: tickLabelColor,
  fontSize: 12,
  fontFamily: 'Futura PT',
  textAnchor: (type === 'x' ? 'middle' as const : 'end' as const),
  dy: (type === 'x' ? undefined : 4),
  dx: (type === 'x' ? undefined : -2),
});

const tooltipWidth = 100;
const scaleXMin = 1;
const scaleXMax = 1;
const scaleYMin = 1;
const scaleYMax = 1;

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

const HOVER_MULTIPLIER = 1.8;
const HOVER_PEER_OPACITY = 0.2;

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

const TooltipCard : FC<CardProps> = ({ children, sx, ...props }) => (
  <Card sx={{ backgroundColor: BeanstalkPalette.theme.winter.extraLight, px: 0.5, py: 0.5, ...sx }} {...props}>
    {children}
  </Card>
);

/// //////////////////////////////// GRAPH ///////////////////////////////////

const Graph: FC<GraphProps> = ({
  height,
  width,
  listings,
  orders,
  maxPlaceInLine,
  maxPlotSize,
}) => {
  ///
  const innerWidth  = width -  (margin.left + margin.right);
  const innerHeight = height - (margin.top  + margin.bottom);
  const svgRef = useRef<SVGRectElement>(null);
  
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
  const [hoveredId, setVoronoiHoveredId] = useState<string | null>(null);
  const [neighborIds, setVoronoiNeighborIds] = useState<Set<string>>(new Set());
  const [orderAction, setOrderAction] = useAtom(podsOrderActionTypeAtom);
  const [orderType, setOrderType] = useAtom(podsOrderTypeAtom);

  const navigate = useNavigate();
  
  /// Helpers
  const peerOpacity = useCallback((_type: TooltipData['type'], _i: number) => (
    !tooltipData?.type 
      ? 1 
      : tooltipData.type === _type
        ? (tooltipData.index === _i ? 1 : HOVER_PEER_OPACITY)
        : HOVER_PEER_OPACITY
  ), [tooltipData]);

  /// Elements
  const orderCircles = orderPositions.map((coordinate, i) => {
    const active = tooltipData?.type === 'order' && i === tooltipData?.index;
    return (
      <Circle
        key={`order-${i}`}
        cx={coordinate.x}
        cy={coordinate.y}
        r={active ? HOVER_MULTIPLIER * coordinate.radius : coordinate.radius}
        opacity={peerOpacity('order', i)}
        fill={BeanstalkPalette.logoGreen}
        stroke={active ? BeanstalkPalette.mediumGreen : '#fff'}
        strokeWidth={active ? 2 : 1}
        cursor="pointer"
        className={`mg-point mg-point-o${active ? ' mg-active' : ''}`}
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
        r={active ? HOVER_MULTIPLIER * coordinate.radius : coordinate.radius}
        opacity={peerOpacity('listing', i)}
        fill={BeanstalkPalette.mediumRed}
        stroke={active ? BeanstalkPalette.trueRed : '#fff'}
        strokeWidth={active ? 2 : 1}
        cursor="pointer"
        className={`mg-point mg-point-l${active ? ' mg-active' : ''}`}
      />
    );
  });
  const voroniPolygons = (
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
  );
  const cursorPositionLines = (tooltipOpen && tooltipData)
    ? tooltipData?.type === 'listing'
      ? (
        <g>
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
          <Text fill="white" x={tooltipData.coordinate.x + 10} y={innerHeight - axis.xHeight} fontSize={14}>
            {displayBN(listings[tooltipData.index].placeInLine)}
          </Text>
          <Text fill="white" x={axis.yWidth + 10} y={tooltipData.coordinate.y - 5} fontSize={14}>
            {listings[tooltipData.index].pricePerPod.toFixed(4)}
          </Text>
        </g>
      )
      : (
        <g>
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
          <Text fill="white" x={tooltipData.coordinate.x + 10} y={innerHeight - axis.xHeight} fontSize={14}>
            {displayBN(orders[tooltipData.index].maxPlaceInLine)}
          </Text>
          <Text fill="white" x={axis.yWidth + 10} y={tooltipData.coordinate.y - 5} fontSize={14}>
            {orders[tooltipData.index].pricePerPod.toFixed(4)}
          </Text>
        </g>
      )
    : null;

  /// Handlers
  const handleMouseMove = useCallback((event: React.MouseEvent | React.TouchEvent, zoom: ProvidedZoom<SVGSVGElement>) => {
    if (!svgRef.current) return;  //
    if (selectedPoint) return;    // skip mouse interaction if a point is selected

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

      setVoronoiNeighborIds(neighbors);
      setVoronoiHoveredId(closest.data.id);
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
      return showTooltip({
        tooltipLeft: zoomedCoordinate.x,
        tooltipTop:  zoomedCoordinate.y,
        tooltipData: {
          index: listingIndex,
          type: 'listing',
          coordinate: coordinate
        }
      });
    }

    ///
    const orderIndex = findPointInCircles(orderPositions, transformedPoint);
    if (orderIndex !== undefined) {
      // Get the original position of the circle (no zoom)
      const coordinate = orderPositions[orderIndex];

      const zoomedCoordinate = zoom.applyToPoint({
        x: coordinate.x,
        y: coordinate.y,
      });

      // Show tooltip at bottom-right corner of circle position.
      // Nudge inward to make hovering easier.
      return showTooltip({
        tooltipLeft:  zoomedCoordinate.x,
        tooltipTop:   zoomedCoordinate.y,
        tooltipData: {
          index: orderIndex,
          type: 'order',
          coordinate: coordinate
        }
      });
    }

    ///
    return hideTooltip();
  }, [hideTooltip, hoveredId, listingPositions, orderPositions, selectedPoint, showTooltip, voronoiLayout]);

  const handleClickFill = useCallback((action: PodOrderAction, type: PodOrderType) => {
    if (orderAction !== action) {
      setOrderAction(action);
    }
    setOrderType(type);
  }, [orderAction, setOrderAction, setOrderType]);

  const handleClick = useCallback(() => { 
    if (selectedPoint) {
      setSelectedPoint(undefined);
      hideTooltip();
    }
    else {
      setSelectedPoint(tooltipData);
      if (tooltipData?.type === 'listing') {
        const data = listings[tooltipData.index];
        if (data) {
          handleClickFill(PodOrderAction.BUY, PodOrderType.FILL);
          navigate(`/market/listing/${data.id}?action=${MARKET_SLUGS[0]}`);
        }
      } else if (tooltipData?.type === 'order') {
        const data = orders[tooltipData.index];
        if (data) {
          handleClickFill(PodOrderAction.SELL, PodOrderType.FILL);
          navigate(`/market/order/${data.id}?action=${MARKET_SLUGS[1]}`);
        }
      }
    }
  }, [handleClickFill, hideTooltip, navigate, listings, orders, selectedPoint, tooltipData]);

  useHotkeys('esc', () => {
    setSelectedPoint(undefined);
    hideTooltip();
  }, {}, [setSelectedPoint, hideTooltip]);
  // useHotkeys('tab', () => {
  //   if (selectedPoint) {
  //     if (selectedPoint.type === 'listing') {
  //       const point = {
  //         index: 0,
  //         coordinate: listingPositions[0],
  //         type: 'listing' as const
  //       };
  //       setSelectedPoint(point);
  //     }
  //   }
  // }, {}, [selectedPoint]);
  
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
          <Box sx={{ position: 'relative' }}>
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
              <PatternLines
                id={PATTERN_ID}
                height={5}
                width={5}
                stroke={BeanstalkPalette.logoGreen}
                strokeWidth={1}
                orientation={['diagonal']}
              />
              <g clipPath="url(#zoom-clip)">
                <g transform={zoom.toString()}>
                  {voroniPolygons}
                  {cursorPositionLines}
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
                onClick={handleClick}
                onMouseMove={(evt) => {
                  zoom.dragMove(evt); // handle zoom drag
                  handleMouseMove(evt, zoom); // handle hover event for tooltips
                }}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                css={{
                  cursor: (
                    selectedPoint
                      ? 'default'         // when selected, freeze cursor
                      : zoom.isDragging
                        ? 'grabbing'      // if dragging, show grab
                        : tooltipData
                          ? 'pointer'     // hovering over a point but haven't clicked it yet
                          : 'grab'        // not hovering a point, user can drag
                  ),
                  touchAction: 'none',
                }}
              />
              <AxisLeft<typeof yScale>
                scale={rescaleYWithZoom(yScale, zoom)}
                left={axis.yWidth}
                numTicks={10}
                stroke={axisColor}
                tickLabelProps={tickLabelProps('y')}
                tickStroke={axisColor}
                tickFormat={(d) => d.valueOf().toFixed(2)}
                hideZero
              />
              {/* X axis: Place in Line */}
              <AxisBottom<typeof xScale>
                scale={rescaleXWithZoom(xScale, zoom)}
                top={height - axis.xHeight}
                left={axis.yWidth}
                numTicks={10}
                stroke={axisColor}
                tickLabelProps={tickLabelProps('x')}
                tickStroke={axisColor}
                tickFormat={(_d) => {
                  const d = _d.valueOf();
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
              tooltipTop != null &&
              !selectedPoint && (
                <Tooltip
                  offsetLeft={10}
                  offsetTop={-40}
                  left={tooltipLeft}
                  top={tooltipTop}
                  width={tooltipWidth}
                  applyPositionStyle
                  style={{
                    // padding: 0,
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
                    {/* <Typography display="block" variant="bodySmall" color="gray" textAlign="left" mt={0.25}>
                      Click to view
                    </Typography> */}
                  </TooltipCard>
                </Tooltip>
            )}
            {/* {selectedPoint && ( */}
            {/*  <SelectedPointPopover */}
            {/*    selectedPoint={selectedPoint} */}
            {/*    orders={orders} */}
            {/*    listings={listings} */}
            {/*    onClose={() => setSelectedPoint(undefined)} */}
            {/*  /> */}
            {/* )} */}
          </Box>
        )}
      </Zoom>
    </>
  );
};

const MarketGraph: FC<MarketGraphProps> = (props) => (
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
