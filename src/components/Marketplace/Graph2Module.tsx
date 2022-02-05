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
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';

import { theme as colorTheme } from 'constants/index';
import { AppState } from 'state';
import { GraphListingTooltip } from './GraphTooltips';
import { AnimatedLineSeries, Axis, XYChart } from '@visx/xychart';
import { curveNatural } from '@visx/curve';

type GraphModuleProps = {
  setCurrentListing: Function;
}

export default function Graph2Module(props: GraphModuleProps) {
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
  } = useTooltip();

  console.log(props.setCurrentListing)

  return (
    <div>
      <XYChart
        xScale={{ type: 'band' }}
        yScale={{ type: 'linear' }}
        height={400}
        width={400}
        // style={{ border: "1px solid red" }}
      >
        Test
        <AnimatedLineSeries
          data={listings}
          dataKey="listings"
          curve={}
          xAccessor={(d) => d.index}
          yAccessor={(d) => d.pricePerPod}
        />
        <Axis
          key="x"
          label="Position in Line"
          orientation="bottom"
          numTicks={4}
        />
        <Axis
          key="y"
          label="Price per Pod"
          orientation="left"
          numTicks={4}
        />
      </XYChart>
      <pre style={{ fontSize: 10, textAlign: 'left' }}>
        {JSON.stringify(listings, null, 2)}
      </pre>
    </div>
  )
}