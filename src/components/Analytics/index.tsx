import React from 'react';
import { ContentSection } from '../Common';
import BaseChart from '../Charts/BaseChart';
import Balances from '../Balances';
import Charts from '../Charts';
import Seasons from '../Seasons';
import { dayBeanQuery } from '../../graph';

export default function Analytics() {
  const [chartData, setChartData] = React.useState<any>([{ data: [{ time: '', value: 0 }] }]);

  const state = {
    options: {
      alignLabels: false,
      grid: {
        vertLines: {
          visible: false,
        },
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: true,
          labelVisible: false,
        },
      },
      timeScale: {
        rightOffset: 12,
        barSpacing: 3,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: false,
        borderColor: '#fff000',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time) => {
          const date = new Date(time.year, time.month, time.day);
          return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        },
      },
      priceScale: {
        title: 'Price',
        position: 'right',
        autoScale: true,
        drawTicks: true,
        PriceLineSource: 'LastVisible',
        priceRange: {
          minValue: 0,
          maxValue: 3,
        },
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: 3,
            maxValue: 0,
          },
        }),
        borderColor: '#555ffd',
        scaleMargins: {
          top: 0.30,
          bottom: 0.25,
        },
      },
    },
  };

  const loadUniswapCharts = async () => {
    const [beanDayQuery] = await Promise.all([
      dayBeanQuery(),
    ]);
    const price = beanDayQuery.map((d) => ({ time: d.x.toISOString('YYYY-MM-DD'), value: d.price }));
    setChartData([{ data: price }]);
  };

  React.useEffect(() => {
    loadUniswapCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ContentSection id="analytics" title="Analytics">
        {chartData[0].data?.length > 1 ? (<BaseChart options={state.options} lineSeries={chartData} autoWidth height={320} />) : <>...loading</>}
        <Balances />
        <Charts />
        <Seasons />
      </ContentSection>
    </>
  );
}
