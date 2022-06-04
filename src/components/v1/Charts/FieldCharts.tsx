import React from 'react';
import { fieldChartStrings } from 'components/Common';
import Charts from './Charts';

export default function FieldCharts(props) {
  const charts = [
    {
        title: 'Real Rate of Return',
        tabTitle: 'RRoR',
        description: fieldChartStrings.rror,
        data: [props.data.map((d) => ({ x: d.x, y: (1 + d.weather) / d.price }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Weather',
        description: fieldChartStrings.weather,
        data: [props.data.map((d) => ({ x: d.x, y: d.weather }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Pods',
        description: fieldChartStrings.pods,
        data: [props.data.map((d) => ({ x: d.x, y: d.pods }))],
    },
    {
        title: 'Pod Rate',
        description: fieldChartStrings.podRate,
        data: [props.data.map((d) => ({ x: d.x, y: 100 * d.pods / d.beans }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Sown Beans',
        tabTitle: 'SOWN',
        description: fieldChartStrings.sown,
        data: [props.data.map((d) => ({ x: d.x, y: d.sownBeans }))],
    },
    {
        title: 'Harvested Pods',
        tabTitle: 'HARVESTED',
        shortTitle: 'Harv.',
        description: fieldChartStrings.harvested,
        data: [props.data.map((d) => ({ x: d.x, y: d.harvestedPods }))],
    },
    {
        title: 'Unique Sowers',
        tabTitle: 'SOWERS',
        description: fieldChartStrings.sowers,
        data: [props.data.map((d) => ({ x: d.x, y: d.numberOfSowers }))],
    },
  ];

  return (
    <Charts mainTitle="Field" charts={charts} />
  );
}
