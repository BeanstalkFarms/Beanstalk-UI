import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { BaseModule, Grid, siloStrings } from 'components/Common';
import MarketplaceBuyModule from './MarketplaceBuyModule';
import MarketplaceSellModule from './MarketplaceSellModule';

export default function TabbedSilo() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const [section, setSection] = useState(0);
  const sectionTitles = ['Buy Pods', 'Sell Pods'];
  const sectionTitlesDescription = [
    siloStrings.lpDescription, // FIXME
    siloStrings.lpDescription, // FIXME
  ];
  const sections = [<MarketplaceBuyModule />, <MarketplaceSellModule />];

  return (
    <Grid
      container
      item
      xs={12}
      spacing={2}
      className="SiloSection"
      alignItems="flex-start"
      justifyContent="center"
      style={{ minHeight: '550px', paddingBottom: 80 }}
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
