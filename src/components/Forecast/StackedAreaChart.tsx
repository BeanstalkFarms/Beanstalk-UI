import React from 'react';
import { AreaStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { GradientOrangeRed } from '@visx/gradient';
import browserUsage from '@visx/mock-data/lib/mocks/browserUsage';
import { scaleTime, scaleLinear } from '@visx/scale';
import { timeParse } from 'd3-time-format';
import ALL_POOLS from 'constants/pools';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { SupportedChainId, TokenMap } from '../../constants';
import { BeanstalkSiloBalance } from '../../state/beanstalk/silo';

export type LiquidityBalancesProps = {
  balances: TokenMap<BeanstalkSiloBalance>;
}

export interface MockPastSiloData {
  date: string;
  // pools -> must be sorted smallest -> largest
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371': string; // UNISWAP
  '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': string; // LUSD
  '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': string; // 3CRV
}

const mockSiloData: MockPastSiloData[] = [
  {
    date: '2022 Jun 16',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '1',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '1',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '10',
  },
  {
    date: '2022 Jun 17',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '1',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '5',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '20',
  },
  {
    date: '2022 Jun 18',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '5',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '10',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '35',
  },
  {
    date: '2022 Jun 19',
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371': '10',
    '0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D': '15',
    '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD': '50'
  }
];

const keys = Object.keys(mockSiloData[0]).filter((k) => k !== 'date') as any[];
const parseDate = timeParse('%Y %b %d');
export const background = 'transparent';

const getDate = (d: MockPastSiloData) => (parseDate(d.date) as Date).valueOf();
const getY0 = (d: SeriesPoint<MockPastSiloData>) => d[0] / 100;
const getY1 = (d: SeriesPoint<MockPastSiloData>) => d[1] / 100;

export type StackedAreasProps = {
  width: number;
  height: number;
  events?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const StackedAreaChart: React.FC<StackedAreasProps> =
  ({
     width,
     height,
     margin = { top: 0, right: 0, bottom: 0, left: 0 },
     events = false,
   }) => {
    // bounds
    const yMax = height - margin.top - margin.bottom;
    const xMax = width - margin.left - margin.right;

    // scales
    const xScale = scaleTime<number>({
      range: [0, xMax],
      domain: [Math.min(...mockSiloData.map(getDate)), Math.max(...mockSiloData.map(getDate))],
    });

    const yScale = scaleLinear<number>({
      range: [yMax, 0],
    });

    return width < 10 ? null : (
      <svg width={width} height={height}>
        <GradientOrangeRed id="stacked-area-orangered" />
        <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
        <AreaStack
          top={margin.top}
          left={margin.left}
          keys={keys}
          data={mockSiloData}
          x={(d) => xScale(getDate(d.data)) ?? 0}
          y0={(d) => yScale(getY0(d)) ?? 0}
          y1={(d) => yScale(getY1(d)) ?? 0}
        >
          {({ stacks, path }) =>
            stacks.map((stack) =>
              (
                <>
                  {/* --- example of how to debug this: --- */}
                  {/* {console.log('STACK KEY', stack.key)} */}
                  {/* {console.log('POOL COLOR', ALL_POOLS[SupportedChainId.MAINNET][`${stack.key}`.toLowerCase()]?.color)} */}
                  <path
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    stroke="transparent"
                    fill={`${ALL_POOLS[SupportedChainId.MAINNET][`${stack.key}`.toLowerCase()]?.color}`}
                    onClick={() => {
                      if (events) alert(`${stack.key}`);
                    }}
                  />
                </>
              ))
          }
        </AreaStack>
      </svg>
    );
  };

/**
 * Wrap the graph in a ParentSize handler.
 */
const SimpleStackedAreaChart: React.FC<{}> = (props) => (
  <ParentSize debounceTime={10}>
    {({ width: visWidth, height: visHeight }) => (
      <StackedAreaChart height={150} width={visWidth} />
    )}
  </ParentSize>
);

export default SimpleStackedAreaChart;
