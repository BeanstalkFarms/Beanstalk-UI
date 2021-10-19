import React, { useState, useEffect } from 'react';
import { BaseModule, ContentSection } from '../Common';
import { Chart } from './Chart';
import { hourUniswapQuery, dayUniswapQuery, dayBeanQuery, hourBeanQuery } from '../../graph';

export default function Charts(props) {
  const [chartData, setChartData] = useState({
    price: [[], []],
    liquidity: [[], []],
    volume: [[], []],
    marketCap: [[], []],
    supply: [[], []],
  });
  const [section, setSection] = useState(0);
  const sectionTitles = ['Price', 'Volume', 'Liquidity', 'Market Cap', 'Supply'];

  const [dataMode, setDataMode] = useState('hr');
  const [timeMode, setTimeMode] = useState('week');

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  const isMobile: boolean = (width <= 550);
  const marginTop = props.marginTop == null ? '-80px' : props.marginTop;

  useEffect(() => {
    loadUniswapCharts();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const modeProps = {
    dataMode: dataMode,
    timeMode: timeMode,
    setDataMode: setDataMode,
    setTimeMode: setTimeMode,
  };

  const sections = [
    <Chart data={props.chartData.price} key="price" size={isMobile ? 'small' : 'medium'} title="Price" {...modeProps} {...props} />,
    <Chart data={props.chartData.volume} key="volume" size={isMobile ? 'small' : 'medium'} title="Volume" {...modeProps} {...props} />,
    <Chart data={props.chartData.liquidity} key="liquidity" size={isMobile ? 'small' : 'medium'} title="Liquidity" {...modeProps} {...props} />,
    <Chart {...modeProps} size={isMobile ? 'small' : 'medium'} key="marketCap" {...props} title="Market Cap" data={props.chartData.marketCap} />,
    <Chart {...modeProps} size={isMobile ? 'small' : 'medium'} key="supply" {...props} title="Supply" data={props.chartData.supply} usd={false} />,
  ];

  const baseStyle = isMobile ? { width: '100vw', paddingLeft: 0, paddingRight: 0 } : null;

  return (
    <BaseModule
      handleTabChange={(event, newSection) => { setSection(newSection); }}
      removeBackground
      section={section}
      sectionTitles={sectionTitles}
      showButton={false}
      size="small"
      style={baseStyle}
      >
      {sections[section]}
    </BaseModule>
  );

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
    setchartData({ price: price, volume: volume, liquidity: liquidity, marketCap: marketCap, supply: supply });
  }
}
