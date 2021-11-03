import React, { useState, useEffect } from 'react';
import Charts from './Charts';
import { hourUniswapQuery, dayUniswapQuery, dayBeanQuery, hourBeanQuery } from '../../graph';

export default function BeanCharts() {
  const [chartData, setChartData] = useState({
    price: [[], []],
    liquidity: [[], []],
    volume: [[], []],
    marketCap: [[], []],
    supply: [[], []],
    crosses: [[], []],
  });

  const charts = [
      {
          title: 'Price',
          description: 'This is the current price at the end of every hour/day.',
          data: chartData.price,
          props: {
              unit: '$',
          },
      },
      {
          title: 'Volume',
          shortTitle: 'Vol.',
          description: 'This is the USD volume in the BEAN:ETH pool at the end of every hour/day.',
          data: chartData.volume,
      },
      {
          title: 'Liquidity',
          shortTitle: 'Liq.',
          description: 'This is the USD value of the BEAN:ETH pool at the end of every hour/day.',
          data: chartData.liquidity,
      },
      {
          title: 'Market Cap',
          shortTitle: 'M. Cap',
          description: 'This is the USD value of the total Bean supply at the end of every hour/day.',
          data: chartData.marketCap,
      },
      {
          title: 'Supply',
          description: 'This is the total Bean supply at the end of every hour/day.',
          data: chartData.supply,
      },
      {
          title: 'Crosses',
          description: 'This is the total number of times that the price of Bean has crossed its peg at the end of every hour/day.',
          data: chartData.crosses,
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
    const crosses = [
      beanHourData.map((d) => ({ x: d.x, y: d.crosses })),
      beanDayData.map((d) => ({ x: d.x, y: d.crosses })),
    ];
    setChartData({ price: price, volume: volume, liquidity: liquidity, marketCap: marketCap, supply: supply, crosses: crosses });
  }

  useEffect(() => {
    loadUniswapCharts();
  }, []);

  return (
    <Charts mainTitle="Bean" charts={charts} />
  );
}
