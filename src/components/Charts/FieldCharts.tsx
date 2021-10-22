import React from 'react';
import Charts from './Charts';

export default function FieldCharts(props) {
  const charts = [
    {
        title: 'Real Rate Of Return',
        shortTitle: 'RRoR',
        data: [props.data.map((d) => ({ x: d.x, y: (1 + d.weather) / d.price }))],
        props: {
            usd: false,
        },
    },
    {
        title: 'Weather',
        data: [props.data.map((d) => ({ x: d.x, y: d.weather }))],
        props: {
            usd: false,
        },
    },
    {
        title: 'Pod Line',
        data: [props.data.map((d) => ({ x: d.x, y: d.pods }))],
        props: {
            usd: false,
        },
    },
    {
        title: 'Sown Beans',
        data: [props.data.map((d) => ({ x: d.x, y: d.sownBeans }))],
        props: {
            usd: false,
        },
    },
    {
        title: 'Harvested Pods',
        data: [props.data.map((d) => ({ x: d.x, y: d.harvestedPods }))],
        props: {
            usd: false,
        },
    },
    {
        title: 'Unique Sowers',
        data: [props.data.map((d) => ({ x: d.x, y: d.numberOfSowers }))],
        props: {
            usd: false,
        },
    },
  ];

  return (
    <Charts mainTitle="Field" charts={charts} />
  );
}
