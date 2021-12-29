import React, { useState, useEffect } from 'react';
import {
  hourUniswapQuery,
  dayUniswapQuery,
  dayBeanQuery,
  hourBeanQuery,
} from 'graph/index';
import useIsMounted from 'util/hooks/isMounted';
import { beanChartStrings } from 'components/Common';
import Charts from './Charts';

export default function BeanCharts() {
  const isMounted = useIsMounted();

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
      description: beanChartStrings.price,
      data: chartData.price,
      props: {
        unit: '$',
      },
    },
    {
      title: 'Volume',
      shortTitle: 'Vol.',
      description: beanChartStrings.volume,
      data: chartData.volume,
    },
    {
      title: 'Liquidity',
      shortTitle: 'Liq.',
      description: beanChartStrings.liquidity,
      data: chartData.liquidity,
    },
    {
      title: 'Market Cap',
      shortTitle: 'M. Cap',
      description: beanChartStrings.marketcap,
      data: chartData.marketCap,
    },
    {
      title: 'Supply',
      description: beanChartStrings.supply,
      data: chartData.supply,
    },
    {
      title: 'Crosses',
      description: beanChartStrings.crosses,
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
    if (isMounted.current) {
      setChartData({
        price: price,
        volume: volume,
        liquidity: liquidity,
        marketCap: marketCap,
        supply: supply,
        crosses: crosses,
      });
    }
  }

  useEffect(() => {
    loadUniswapCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Charts
      mainTitle="Bean"
      charts={charts}
    />
  );
}
