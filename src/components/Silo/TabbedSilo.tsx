import React, { useState } from 'react';
import { BaseModule, Grid, siloStrings } from 'components/Common';
import SiloBeanModule from './SiloBeanModule';
import SiloLPModule from './SiloLPModule';

export default function TabbedSilo() {
  const { innerWidth: width } = window;

  const [section, setSection] = useState(0);
  const sectionTitles = ['LP', 'Beans'];
  const sectionTitlesDescription = [
    siloStrings.lpDescription,
    siloStrings.beanDescription,
  ];
  const sections = [<SiloLPModule />, <SiloBeanModule />];

  return (
    <Grid
      container
      item
      xs={12}
      spacing={2}
      className="SiloSection"
      alignItems="flex-start"
      justifyContent="center"
      style={{ minHeight: '550px', height: '100%' }}
    >
      <Grid
        item
        md={6}
        sm={12}
        style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
      >
        <BaseModule
          handleTabChange={(event, newSection) => {
            setSection(newSection);
          }}
          section={section}
          sectionTitles={sectionTitles}
          sectionTitlesDescription={sectionTitlesDescription}
          showButton={false}
          removeBackground
        >
          {sections[section]}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
