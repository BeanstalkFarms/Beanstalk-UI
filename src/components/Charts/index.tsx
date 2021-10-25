import React, { useState, useEffect } from 'react';
import { BaseModule, ContentSection } from '../Common';
import BeanCharts from './BeanCharts';
import SiloCharts from './SiloCharts';
import FieldCharts from './FieldCharts';
import { beanstalkQuery } from '../../graph';

export default function Charts(props) {
  const marginTop = props.marginTop == null ? '-80px' : props.marginTop;
  const [chartData, setChartData] = useState([]);
  const [section, setSection] = useState(0);

  async function loadBeanstalkData() {
    const beanstalkData = await beanstalkQuery();
    setChartData(beanstalkData);
  }

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  const isMobile: boolean = (width <= 758);
  const baseStyle = isMobile ? { width: '100vw', paddingLeft: 0, paddingRight: 0 } : null;

  useEffect(() => {
    loadBeanstalkData();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);
  const titles = ['Bean', 'Field', 'Silo'];
  const descriptions = [
    'Use this tab to view charts with information about the BEAN token.',
    'Use this tab to view charts with information about the Silo.',
    'Use this tab to view charts with information about the Field.',
  ];

  const sections = [
    <BeanCharts />,
    <FieldCharts data={chartData} />,
    <SiloCharts data={chartData} />,
  ];

  return (
    <ContentSection
      id="charts"
      title="Charts"
      size="20px"
      style={{ minHeight: '600px', maxWidth: '1000px', marginTop: marginTop }}
    >
      <BaseModule
        handleTabChange={(event, newSection) => { setSection(newSection); }}
        removeBackground
        section={section}
        sectionTitlesDescription={descriptions}
        size={isMobile ? 'small' : 'medium'}
        sectionTitles={titles}
        showButton={false}
        style={baseStyle}
      >
        {sections[section]}
      </BaseModule>
    </ContentSection>
  );
}
