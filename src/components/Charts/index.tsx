/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { BaseModule, chartStrings, ContentSection } from 'components/Common';
import { beanstalkQuery } from 'graph/index';
import BaseChart from './BaseChart';
import BeanCharts from './BeanCharts';
// import SiloCharts from './SiloCharts';
// import FieldCharts from './FieldCharts';

export default function Charts(props) {
  const marginTop = props.marginTop == null ? '0px' : props.marginTop;
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

  const isMobile: boolean = width <= 758;
  const baseStyle = isMobile
    ? { width: '100vw', paddingLeft: 0, paddingRight: 0 }
    : null;

  useEffect(() => {
    loadBeanstalkData();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const titles = ['Bean', 'Field', 'Silo'];
  const descriptions = [
    chartStrings.bean,
    chartStrings.field,
    chartStrings.silo,
  ];
  const sections = [
    <BeanCharts />,
    // <FieldCharts data={chartData} />,
    // <SiloCharts data={chartData} />,
  ];

  return (
    <ContentSection
      id="charts"
      title={props.title}
      size="20px"
      style={{ maxWidth: '1000px', marginTop: marginTop }}
    >
      <BaseModule
        handleTabChange={(event, newSection) => {
          setSection(newSection);
        }}
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
Charts.defaultProps = {
  title: 'Charts',
};
