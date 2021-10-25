import React from 'react';
import Charts from './Charts';
import { TabImageModule, SiloAsset, TransitAsset } from '../Common';

export default function SiloCharts(props) {
  const charts = [
      {
          tabTitle: <TabImageModule
            token={SiloAsset.Bean}
            description="This is the current total Deposited Beans by Season."
        />,
          title: 'Deposited Beans',
          data: [props.data.map((d) => ({ x: d.x, y: d.depositedBeans }))],
      },
      {
          title: 'Withdrawn Beans',
          tabTitle: <TabImageModule
            token={TransitAsset.Bean}
            description="This is the current total Withdrawn Beans by Season."
        />,
          data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnBeans }))],
          props: {
              usd: false,
          },
      },
      {
          title: 'Deposited LP',
          tabTitle: <TabImageModule
            token={SiloAsset.LP}
            description="This is the current total Deposited LP Tokens by Season."
        />,
          data: [props.data.map((d) => ({ x: d.x, y: d.depositedLP }))],
      },
      {
          title: 'Withdrawn LP',
          tabTitle: <TabImageModule
            token={TransitAsset.LP}
            description="This is the current total Withdrawn LP Tokens by Season."
        />,
          data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnLP }))],
      },
      {
          tabTitle: <TabImageModule
            token={SiloAsset.Stalk}
            description="This is the current total Stalk by Season."
        />,
          data: [props.data.map((d) => ({ x: d.x, y: d.stalk }))],
      },
      {
          tabTitle: <TabImageModule
            token={SiloAsset.Seed}
            description="This is the current total Seeds by Season."
           />,
          data: [props.data.map((d) => ({ x: d.x, y: d.seeds }))],
      },
  ];

  return (
    <Charts mainTitle="Silo" charts={charts} />
  );
}
