import React from 'react';
import { Box } from '@material-ui/core';
import { ChartDonut, ChartLabel } from '@patternfly/react-charts';
import { CryptoAsset } from '../Common';

export default function BalanceChart(props) {
  const chartSizeStyle = {
    fontFamily: 'Futura-PT-Book',
    height: '100%',
    width: '90%',
    margin: '0 10%',
  };
  const svgStyle = {
    maxHeight: '140px',
    maxWidth: '140px',
    margin: '8px auto 4px auto',
  };

  const colors = [
    '#B3CDE3',
    '#CCEBC5',
    '#DECBE4',
    '#FBB4AE',
    '#C5AC77',
    '#DEDBDB',
    '#FED9A6',
  ];

  const balance = (
    props.circulating
      .plus(props.silo)
      .plus(props.transit)
      .plus(props.pool === undefined ? 0 : props.pool)
      .plus(props.claimable)
      .plus(props.budget === undefined ? 0 : props.budget)
  );

  const data =
    balance.isGreaterThan(0) || balance === undefined
      ? [
         { x: 'Circulating', y: props.circulating, fill: colors[0] },
         { x: 'Silo', y: props.silo, fill: colors[1] },
         { x: 'Transit', y: props.transit, fill: colors[2] },
         { x: 'Pool', y: props.pool, fill: colors[3] },
         { x: 'Claimable', y: props.claimable, fill: colors[4] },
         { x: 'Budget', y: props.budget, fill: colors[6] },
        ]
      : [{ x: 'Empty', y: 100, fill: colors[5] }];

  return (
    <Box style={chartSizeStyle}>
      <svg style={svgStyle}>
        <ChartDonut
          standalone={false}
          constrainToVisibleArea={false}
          data={data}
          height={140}
          width={140}
          labels={() => null}
          titleComponent={
            props.asset === CryptoAsset.Bean ? (
              <ChartLabel style={[{ fontSize: 20 }, { fontSize: 14 }]} />
            ) : (
              <ChartLabel style={[{ fontSize: 14 }, { fontSize: 14 }]} />
            )
          }
          title={props.total}
          subTitle={props.title}
          innerRadius={55}
          padding={0}
          padAngle={0}
          style={{
            data: {
              fill: ({ datum }) => datum.fill,
            },
            labels: {
              fontSize: '20px',
              fontFamily: 'Futura-PT-Book',
              fill: ({ datum }) => datum.fill,
            },
            parent: {
              border: '0px',
            },
          }}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onMouseOver: () => [
                  {
                    target: 'data',
                    mutation: balance.isGreaterThan(0)
                      ? (p) => {
                          props.setActive(p.index);
                        }
                      : null,
                  },
                  {
                    target: 'labels',
                    mutation: () => ({ active: true }),
                  },
                ],
                onMouseOut: () => [
                  {
                    target: 'data',
                    mutation: () => props.setActive(-1),
                  },
                  {
                    target: 'labels',
                    mutation: () => ({ active: false }),
                  },
                ],
              },
            },
          ]}
        />
      </svg>
    </Box>
  );
}
