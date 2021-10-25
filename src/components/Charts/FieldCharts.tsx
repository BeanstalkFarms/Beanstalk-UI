import React from 'react';
import Charts from './Charts';

export default function FieldCharts(props) {
  const charts = [
    {
        title: 'Real Rate Of Return',
        shortTitle: 'RRoR',
        data: [props.data.map((d) => ({ x: d.x, y: (1 + d.weather) / d.price }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Weather',
        data: [props.data.map((d) => ({ x: d.x, y: d.weather }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Pod Line',
        data: [props.data.map((d) => ({ x: d.x, y: d.pods }))],
    },
    {
        title: 'Sown Beans',
        data: [props.data.map((d) => ({ x: d.x, y: d.sownBeans }))],
    },
    {
        title: 'Harvested Pods',
        data: [props.data.map((d) => ({ x: d.x, y: d.harvestedPods }))],
    },
    {
        title: 'Unique Sowers',
        data: [props.data.map((d) => ({ x: d.x, y: d.numberOfSowers }))],
    },
  ];

  return (
    <Charts mainTitle="Field" charts={charts} />
  );
}
