import React from 'react';
import Charts from './Charts';

export default function FieldCharts(props) {
  const charts = [
    {
        title: 'Real Rate Of Return',
        tabTitle: 'RRoR',
        description: 'This is the current total Real Rate of Return by Season. Real Rate of Return is defined as RRoR = (1 + W) / TWAP.',
        data: [props.data.map((d) => ({ x: d.x, y: (1 + d.weather) / d.price }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Weather',
        description: 'This is the current Weather by Season.',
        data: [props.data.map((d) => ({ x: d.x, y: d.weather }))],
        props: {
            unit: '%',
        },
    },
    {
        title: 'Pods',
        description: 'This is the current Unharvestable Pods by Season.',
        data: [props.data.map((d) => ({ x: d.x, y: d.pods }))],
    },
    {
        title: 'Sown Beans',
        tabTitle: 'Sown',
        description: 'This is the current total Sown Beans by Season.',
        data: [props.data.map((d) => ({ x: d.x, y: d.sownBeans }))],
    },
    {
        title: 'Harvested Pods',
        tabTitle: 'Harvested',
        xShortTitle: 'Harv.',
        description: 'This is the current total Harvested Pods by Season.',
        data: [props.data.map((d) => ({ x: d.x, y: d.harvestedPods }))],
    },
    {
        title: 'Unique Sowers',
        tabTitle: 'Sowers',
        description: 'This is the current total unique Sowers by Season.',
        data: [props.data.map((d) => ({ x: d.x, y: d.numberOfSowers }))],
    },
  ];

  return (
    <Charts mainTitle="Field" charts={charts} />
  );
}
