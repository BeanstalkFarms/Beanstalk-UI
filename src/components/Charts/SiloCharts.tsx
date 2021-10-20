import React, { useState, useEffect } from 'react';
import Charts from './Charts';
import { beanstalkQuery } from '../../graph/BeanstalkGraph';

export default function SiloCharts(props) {
  const [chartData, setChartData] = useState({
    depositedBeans: [[]],
    withdrawnBeans: [[]],
    depositedLP: [[]],
    withdrawnLP: [[]],
    stalk: [[]],
    seeds: [[]],
  });

  const charts = [
      {
          title: 'Deposited Beans',
          data: chartData.depositedBeans,
          props: {
              usd: false,
          },
      },
      {
          title: 'Withdrawn Beans',
          data: chartData.withdrawnBeans,
          props: {
              usd: false,
          },
      },
      {
          title: 'Deposited LP',
          data: chartData.depositedLP,
          props: {
              usd: false,
          },
      },
      {
          title: 'Withdrawn LP',
          data: chartData.withdrawnLP,
          props: {
              usd: false,
          },
      },
      {
          title: 'Stalk',
          data: chartData.stalk,
          props: {
              usd: false,
          },
      },
      {
          title: 'Seeds',
          data: chartData.seeds,
          props: {
              usd: false,
          },
      },
  ];

  async function loadBeanstalkData() {
    const beanstalkData = await beanstalkQuery();
    const depositedBeans = beanstalkData.map((d) => ({ x: d.x, y: d.depositedBeans }));
    const withdrawnBeans = beanstalkData.map((d) => ({ x: d.x, y: d.withdrawnBeans }));
    const depositedLP = beanstalkData.map((d) => ({ x: d.x, y: d.depositedLP }));
    const withdrawnLP = beanstalkData.map((d) => ({ x: d.x, y: d.withdrawnLP }));
    const seeds = beanstalkData.map((d) => ({ x: d.x, y: d.seeds }));
    const stalk = beanstalkData.map((d) => ({ x: d.x, y: d.stalk }));
    setChartData({ depositedBeans: [depositedBeans], withdrawnBeans: [withdrawnBeans], depositedLP: [depositedLP], withdrawnLP: [withdrawnLP], seeds: [seeds], stalk: [stalk] });
  }

  useEffect(() => {
    loadBeanstalkData();
  }, []);

  return (
    <Charts {...props} mainTitle="Silo" charts={charts} />
  );
}
