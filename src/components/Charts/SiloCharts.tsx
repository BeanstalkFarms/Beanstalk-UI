import React from 'react';
import {
  SiloAsset,
  siloChartStrings,
  TabImageModule,
  TransitAsset,
} from 'components/Common';
import Charts from './Charts';

export default function SiloCharts(props) {
  const charts = [
    {
      tabTitle: (
        <TabImageModule
          token={SiloAsset.Bean}
          description={siloChartStrings.depositedBeans}
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
          description={siloChartStrings.withdrawnBeans}
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnBeans }))],
    },
    {
      title: 'Deposited LP',
      tabTitle: (
        <TabImageModule
          token={SiloAsset.LP}
          description={siloChartStrings.depositedLP}
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.depositedLP }))],
    },
    {
      title: 'Withdrawn LP',
      tabTitle: (
        <TabImageModule
          token={TransitAsset.LP}
          description={siloChartStrings.withdrawnLP}
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.withdrawnLP }))],
    },
    {
      title: 'Stalk',
      tabTitle: (
        <TabImageModule
          token={SiloAsset.Stalk}
          description={siloChartStrings.stalk}
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.stalk }))],
    },
    {
      title: 'Seeds',
      tabTitle: (
        <TabImageModule
          token={SiloAsset.Seed}
          description={siloChartStrings.seeds}
        />
      ),
      data: [props.data.map((d) => ({ x: d.x, y: d.seeds }))],
    },
  ];

  return <Charts mainTitle="Silo" charts={charts} />;
}
