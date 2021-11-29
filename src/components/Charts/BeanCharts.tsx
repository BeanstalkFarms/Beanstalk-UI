import React, { useState, useEffect } from 'react';
import {
  hourUniswapQuery,
  dayUniswapQuery,
  dayBeanQuery,
  hourBeanQuery,
} from 'graph/index';
import useIsMounted from 'util/hooks/isMounted';
import { beanChartStrings } from 'components/Common';
// import LoadingBean from 'components/App/LoadingBean';
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
      type: 'baseline',
    },
    {
      title: 'Volume',
      shortTitle: 'Vol.',
      description: beanChartStrings.volume,
      data: chartData.volume,
      type: 'line',
    },
    {
      title: 'Liquidity',
      shortTitle: 'Liq.',
      description: beanChartStrings.liquidity,
      data: chartData.liquidity,
      type: 'line',
    },
    {
      title: 'Market Cap',
      shortTitle: 'M. Cap',
      description: beanChartStrings.marketcap,
      data: chartData.marketCap,
      type: 'area',
    },
    {
      title: 'Supply',
      description: beanChartStrings.supply,
      data: chartData.supply,
      type: 'bar',
    },
    {
      title: 'Crosses',
      description: beanChartStrings.crosses,
      data: chartData.crosses,
      type: 'histogram',
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
      beanHourData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.price })),
      beanDayData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.price })),
    ];
    const volume = [
      hourData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.volume })),
      dayData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.volume })),
    ];
    const liquidity = [
      hourData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.liquidity })),
      dayData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.liquidity })),
    ];
    const supply = [
      beanHourData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.totalSupply })),
      beanDayData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.totalSupply })),
    ];
    const marketCap = [
      beanHourData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.totalSupplyUSD })),
      beanDayData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.totalSupplyUSD })),
    ];
    const crosses = [
      beanHourData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.crosses })),
      beanDayData.map((d) => ({ time: (d.x.getTime() / 1000), value: d.crosses })),
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

  return <Charts mainTitle="Bean" charts={charts} />;
}
