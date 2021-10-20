import React, { useState, useEffect } from 'react';
import Charts from './Charts';
import { beanstalkQuery } from '../../graph/BeanstalkGraph';

export default function FieldCharts(props) {
  const [chartData, setChartData] = useState({
    realRateOfReturn: [[]],
    weather: [[]],
    pods: [[]],
    sownBeans: [[]],
    harvestedPods: [[]],
  });

  const charts = [
    {
        title: 'Real Rate Of Return',
        data: chartData.realRateOfReturn,
        props: {
            usd: false,
        },
    },
    {
        title: 'Weather',
        data: chartData.weather,
        props: {
            usd: false,
        },
    },
    {
        title: 'Pod Line',
        data: chartData.pods,
        props: {
            usd: false,
        },
    },
    {
        title: 'Sown Beans',
        data: chartData.sownBeans,
        props: {
            usd: false,
        },
    },
    {
        title: 'Harvested Pods',
        data: chartData.harvestedPods,
        props: {
            usd: false,
        },
    },
  ];

  async function loadBeanstalkData() {
    const beanstalkData = await beanstalkQuery();
    const realRateOfReturn = beanstalkData.map((d) => ({ x: d.x, y: (1 + d.weather) / d.price / 100 }));
    const weather = beanstalkData.map((d) => ({ x: d.x, y: d.weather }));
    const pods = beanstalkData.map((d) => ({ x: d.x, y: d.pods }));
    const sownBeans = beanstalkData.map((d) => ({ x: d.x, y: d.sownBeans }));
    const harvestedPods = beanstalkData.map((d) => ({ x: d.x, y: d.harvestedPods }));
    setChartData({ realRateOfReturn: [realRateOfReturn], weather: [weather], pods: [pods], sownBeans: [sownBeans], harvestedPods: [harvestedPods] });
  }

  useEffect(() => {
    loadBeanstalkData();
  }, []);

  return (
    <Charts {...props} mainTitle="Field" charts={charts} />
  );
}
