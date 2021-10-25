import React, { useState, useEffect } from 'react';
import { ContentSection } from '../Common';
import BeanCharts from './BeanCharts';
import SiloCharts from './SiloCharts';
import FieldCharts from './FieldCharts';
import { beanstalkQuery } from '../../graph';

export default function Charts(props) {
  const marginTop = props.marginTop == null ? '-80px' : props.marginTop;
  const [chartData, setChartData] = useState([]);

  async function loadBeanstalkData() {
    const beanstalkData = await beanstalkQuery();
    setChartData(beanstalkData);
  }

  useEffect(() => {
    loadBeanstalkData();
  }, []);

  return (
    <ContentSection
      id="charts"
      title="Charts"
      size="20px"
      style={{ minHeight: '600px', maxWidth: '1000px', marginTop: marginTop }}
    >
      <hr />
      <SiloCharts data={chartData} />
      <FieldCharts data={chartData} />
      <BeanCharts />
    </ContentSection>
  );
}
