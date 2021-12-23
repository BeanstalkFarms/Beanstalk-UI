import React, { useState, useEffect } from 'react';
import { fieldChartStrings } from 'components/Common';
import { soilQuery } from 'graph/index';
import Charts from './Charts';

export default function FieldCharts(props) {
  const [soilData, setSoilData] = useState([]);

  async function loadSoilData() {
    const beanstalkData = await soilQuery();
    setSoilData(beanstalkData);
  }

  useEffect(() => {
    loadSoilData();
  }, []);

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
        title: 'Soil',
        description: fieldChartStrings.soil,
        data: [soilData.map((d) => ({ x: d.x, y: d.soil }))],
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
