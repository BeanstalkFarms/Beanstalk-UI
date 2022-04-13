import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';

import { BaseModule, chartStrings, ContentSection } from 'components/Common';
import { beanstalkQuery } from 'graph/index';
import { AppState } from 'state';
import { makeStyles } from '@material-ui/core/styles';
import BeanCharts from './BeanCharts';
import SiloCharts from './SiloCharts';
import FieldCharts from './FieldCharts';

const useStyles = makeStyles({
  root: {
    margin: 'auto',
    width: '100%'
  }
});

export default function Charts(props) {
  const classes = useStyles();
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
  const isMobile: boolean = width <= 850;
  // const baseStyle = isMobile
  //   ? { paddingLeft: 0, paddingRight: 0 }
  //   : {  }; // minWidth: 600

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
    <Grid
      className={classes.root}
      container
      item
      md={10}
      sm={10}
      xs={10}
      justifyContent="center">
      <ContentSection
        id="charts"
        title={props.title}
        size="20px"
        style={{
          width: '100%',
          marginTop: 0,
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
          style={{
            width: '100%',
          }}
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
