import React from 'react';
import { TabImageModule, SiloAsset, TransitAsset } from 'components/Common';
import Charts from './Charts';

export default function SiloCharts(props) {
  const charts = [
    {
      tabTitle: (
        <TabImageModule
          token={SiloAsset.Bean}
          description="This is the current total Deposited Beans by Season."
        />
      ),
      title: 'Deposited Beans',
      data: [props.data.map((d) => ({ x: d.x, y: d.depositedBeans }))],
    },
    {
      title: 'Withdrawn Beans',
      tabTitle: (
        <TabImageModule
          token={TransitAsset.Bean}
          description="This is the current total Withdrawn Beans by Season."
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnBeans }))],
    },
    {
      title: 'Deposited LP',
      tabTitle: (
        <TabImageModule
          token={SiloAsset.LP}
          description="This is the current total Deposited LP Tokens by Season."
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.depositedLP }))],
    },
    {
      title: 'Withdrawn LP',
      tabTitle: (
        <TabImageModule
          token={TransitAsset.LP}
          description="This is the current total Withdrawn LP Tokens by Season."
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnLP }))],
    },
    {
      title: 'Stalk',
      tabTitle: (
        <TabImageModule
          token={SiloAsset.Stalk}
          description="This is the current total Stalk by Season."
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.stalk }))],
    },
    {
      title: 'Seeds',
      tabTitle: (
        <TabImageModule
          token={SiloAsset.Seed}
          description="This is the current total Seeds by Season."
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.seeds }))],
    },
  ];

  return <Charts mainTitle="Silo" charts={charts} />;
}
