import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

import { BaseModule, Grid, siloStrings } from 'components/Common';
import MarketplaceBuyModule from './MarketplaceBuyModule';
import MarketplaceSellModule from './MarketplaceSellModule';
import ListingsTable from './Listings/ListingsTable';
import Offers from './Offers/Offers';
// import GraphModule from './GraphModule';

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
      {/* Column: Buy/Sell */}
      <Grid
        item
        lg={6}
        md={9}
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
      {/* Column: My Market */}
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
          section={0}
          sectionTitles={['My Market']}
          showButton={false}
          removeBackground
        >
          {/* My Bids (aka Offers) */}
          <BaseModule
            marginTop="20px"
            sectionTitles={['My Bids']}
            sectionTitlesDescription={['Bids for Pods you\'re willing to buy on the Market']}
            showButton={false}
          >
            <Offers mode="MINE" />
          </BaseModule>
          {/* My Listings */}
          <BaseModule
            marginTop="20px"
            sectionTitles={['My Listings']}
            sectionTitlesDescription={['Pods you have listed for sale on the Market']}
            showButton={false}
          >
            <ListingsTable mode="MINE" />
          </BaseModule>
          {/* Graph */}
          {/* <BaseModule
            marginTop="20px"
            sectionTitles={[]}
            sectionTitlesDescription={[]}
            showButton={false}
          >
            <GraphModule />
          </BaseModule> */}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
