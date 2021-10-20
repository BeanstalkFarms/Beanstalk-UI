import React, { useState, useEffect } from 'react';
import Charts from './Charts';
import { hourUniswapQuery, dayUniswapQuery, dayBeanQuery, hourBeanQuery } from '../../graph';

export default function BeanCharts(props) {
  const [chartData, setChartData] = useState({
    price: [[], []],
    liquidity: [[], []],
    volume: [[], []],
    marketCap: [[], []],
    supply: [[], []],
  });

  const charts = [
      {
          title: 'Price',
          data: chartData.price,
      },
      {
          title: 'Volume',
          data: chartData.volume,
      },
      {
          title: 'Liquidity',
          data: chartData.liquidity,
      },
      {
          title: 'Market Cap',
          data: chartData.marketCap,
      },
      {
          title: 'Supply',
          data: chartData.supply,
          props: {
              usd: false,
          },
      },
  ];

  async function loadUniswapCharts() {
    const [dayData, hourData, beanDayData, beanHourData] = await Promise.all([
      dayUniswapQuery(),
      hourUniswapQuery(),
      dayBeanQuery(),
      hourBeanQuery(),
    ]);
    const price = [
      beanHourData.map((d) => ({ x: d.x, y: d.price })),
      beanDayData.map((d) => ({ x: d.x, y: d.price })),
    ];
    const volume = [
      hourData.map((d) => ({ x: d.x, y: d.volume })),
      dayData.map((d) => ({ x: d.x, y: d.volume })),
    ];
    const liquidity = [
      hourData.map((d) => ({ x: d.x, y: d.liquidity })),
      dayData.map((d) => ({ x: d.x, y: d.liquidity })),
    ];
    const supply = [
      beanHourData.map((d) => ({ x: d.x, y: d.totalSupply })),
      beanDayData.map((d) => ({ x: d.x, y: d.totalSupply })),
    ];
    const marketCap = [
      beanHourData.map((d) => ({ x: d.x, y: d.totalSupplyUSD })),
      beanDayData.map((d) => ({ x: d.x, y: d.totalSupplyUSD })),
    ];
    setChartData({ price: price, volume: volume, liquidity: liquidity, marketCap: marketCap, supply: supply });
  }

  useEffect(() => {
    loadUniswapCharts();
  }, []);

  return (
    <Charts {...props} mainTitle="Bean" charts={charts} />
  );
}
