import React, { useState, useEffect } from 'react';
import { Container, Grid } from '@mui/material';
import { useSelector } from 'react-redux';

import { BaseModule, chartStrings,  } from 'components/Common';
import { beanstalkQuery } from 'graph/index';
import { AppState } from 'state';
import BeanCharts from './BeanCharts';
import SiloCharts from './SiloCharts';
import FieldCharts from './FieldCharts';

export default function Charts() {
  const [chartData, setChartData] = useState([]);
  const [section, setSection] = useState(0);
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  // Load data when component is mounted.
  useEffect(() => {
    async function loadBeanstalkData() {
      const beanstalkData = await beanstalkQuery();
      setChartData(beanstalkData);
    }
    loadBeanstalkData();
  }, []);

  //
  const isMobile: boolean = width <= 850;

  // Sections
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
    <Container maxWidth="xl">
      <Grid container justifyContent="center">
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
          style={{ width: '100%' }}
        >
          {sections[section]}
        </BaseModule>
      </Grid>
    </Container>
  );
}
