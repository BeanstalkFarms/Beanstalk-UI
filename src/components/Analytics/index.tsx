import React from 'react';
import { ContentSection } from '../Common';
import BaseChart from '../Charts/BaseChart';
import Balances from '../Balances';
import Charts from '../Charts';
import Seasons from '../Seasons';
import { hourBeanQuery } from '../../graph';

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
          labelVisible: true,
        },
        vertLine: {
          visible: true,
          labelVisible: true,
        },
      },
      timeScale: {
        rightOffset: 12,
        barSpacing: 3,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: false,
        borderVisible: false,
        borderColor: '#fff000',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
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
        borderColor: '#555ffd',
        scaleMargins: {
          top: 0.30,
          bottom: 0.25,
        },
      },
      baseline: {
        topFillColor1: 'rgba(21, 146, 230, 0.4)',
        topFillColor2: 'rgba(21, 255, 70, 0.3)',
        bottomFillColor1: 'rgba(21, 255, 70, 0.3)',
        bottomFillColor2: 'rgba(21, 146, 230, 0.4)',
        topLineColor: 'rgba(21, 146, 230, 1)',
        lineStyle: 0,
        lineWidth: 3,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 3,
        crosshairMarkerBorderColor: 'rgb(255, 255, 255, 1)',
        crosshairMarkerBackgroundColor: 'rgb(34, 150, 243, 1)',
        baseValue: {
          type: 'price',
          price: 1,
        },
        priceFormat: {
          type: 'price',
          precision: 3,
          minMove: 0.001,
        },
      },
    },
  };

  const loadUniswapCharts = async () => {
    const [beanHourQuery] = await Promise.all([
      hourBeanQuery(),
    ]);
    const price = beanHourQuery.map((d) => ({ time: (d.x.getTime() / 1000), value: d.price }));
    setChartData([{
      data: price,
      options: state.options.baseline,
    }]);
  };

  React.useEffect(() => {
    loadUniswapCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDateRange = () => {
    const dateOffset = (24 * 60 * 60 * 1000) * 4;
    const todayTimestamp = new Date();
    const threeDaysBefore = new Date(todayTimestamp.getTime() - dateOffset);
    const from = threeDaysBefore.getTime() / 1000;
    const to = todayTimestamp.getTime() / 1000;
    return { from, to };
  };

  const { from, to } = getDateRange();

  return (
    <>
      <ContentSection id="analytics" title="Analytics">
        {chartData[0].data?.length > 1 ? (<BaseChart options={state.options} from={from} to={to} baselineSeries={chartData} autoWidth height={300} />) : <>...loading</>}
        <Balances />
        <Charts />
        <Seasons />
      </ContentSection>
    </>
  );
}
