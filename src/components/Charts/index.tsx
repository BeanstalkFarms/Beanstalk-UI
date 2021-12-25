import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';

import { BaseModule, chartStrings, ContentSection } from 'components/Common';
import { beanstalkQuery } from 'graph/index';
import BeanCharts from './BeanCharts';
import SiloCharts from './SiloCharts';
import FieldCharts from './FieldCharts';
import { AppState } from 'state';

export default function Charts(props) {
  //
  const [chartData, setChartData] = useState([]);
  const [section, setSection] = useState(0);
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
 
  //
  useEffect(() => {
    async function loadBeanstalkData() {
      const beanstalkData = await beanstalkQuery();
      setChartData(beanstalkData);
    }
    loadBeanstalkData();
  }, []);

  //
  const isMobile: boolean = width <= 758;
  const baseStyle = isMobile
    ? { width: '95%', paddingLeft: 0, paddingRight: 0 }
    : { width: '95%' };

  //
  const titles = ['Bean', 'Field', 'Silo'];
  const descriptions = [
    chartStrings.bean,
    chartStrings.field,
    chartStrings.silo,
  ];
  const sections = [
    <BeanCharts />,
    <FieldCharts data={chartData} />,
    <SiloCharts data={chartData} />,
  ];

  //
  return (
    <Grid style={{ margin: 'auto' }} container item xs={12} justifyContent="center">
      <ContentSection
        id="charts"
        title={props.title}
        size="20px"
        style={{
          maxWidth: '1000px',
          marginTop: props.marginTop || 0,
        }}
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
    </Grid>
  );
}

Charts.defaultProps = {
  title: 'Charts',
};
