import React from 'react';
import Charts from './Charts';

export default function SiloCharts(props) {
  const charts = [
      {
          title: 'Deposited Beans',
          shortTitle: 'Dep. Beans',
          data: [props.data.map((d) => ({ x: d.x, y: d.depositedBeans }))],
          props: {
              usd: false,
          },
      },
      {
          title: 'Withdrawn Beans',
          shortTitle: 'With. Beans',
          data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnBeans }))],
          props: {
              usd: false,
          },
      },
      {
          title: 'Deposited LP',
          shortTitle: 'Dep. LP',
          data: [props.data.map((d) => ({ x: d.x, y: d.depositedLP }))],
          props: {
              usd: false,
          },
      },
      {
          title: 'Withdrawn LP',
          shortTitle: 'With. LP',
          data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnLP }))],
          props: {
              usd: false,
          },
      },
      {
          title: 'Stalk',
          data: [props.data.map((d) => ({ x: d.x, y: d.stalk }))],
          props: {
              usd: false,
          },
      },
      {
          title: 'Seeds',
          data: [props.data.map((d) => ({ x: d.x, y: d.seeds }))],
          props: {
              usd: false,
          },
      },
  ];

  return (
    <Charts mainTitle="Silo" charts={charts} />
  );
}
