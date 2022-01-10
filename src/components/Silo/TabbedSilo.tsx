import React, { useState } from 'react';
import { BaseModule, Grid, siloStrings } from 'components/Common';
import SiloBeanModule from './SiloBeanModule';
import SiloLPModule from './SiloLPModule';
import SiloConvertModule from './SiloConvertModule';

export default function TabbedSilo() {
  const { innerWidth: width } = window;

  const [section, setSection] = useState(0);
  const sectionTitles = ['LP', 'Beans', 'Convert'];
  const sectionTitlesDescription = [
    siloStrings.lpDescription,
    siloStrings.beanDescription,
    siloStrings.convert,
  ];
  const sections = [<SiloLPModule />, <SiloBeanModule />, <SiloConvertModule />];

  return (
    <Grid
      container
      item
      xs={12}
      spacing={2}
      className="SiloSection"
      alignItems="flex-start"
      justifyContent="center"
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
