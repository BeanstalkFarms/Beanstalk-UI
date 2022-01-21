import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

import { BaseModule, Grid, siloStrings, ListTable, FarmAsset } from 'components/Common';
import MarketplaceBuyModule from './MarketplaceBuyModule';
import MarketplaceSellModule from './MarketplaceSellModule';
import Listings from './Listings/Listings';
import Offers from './Offers/Offers';
// import GraphModule from './GraphModule';

export default function TabbedMarketplace() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const { harvestablePodBalance, plots, harvestablePlots } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  const [section, setSection] = useState(0);
  const [page, setPage] = useState(0);
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
          {/**
            * My Bids (aka Offers) */}
          <BaseModule
            marginTop="20px"
            sectionTitles={['My Bids']}
            sectionTitlesDescription={['Bids for Pods you\'re willing to buy on the Market']}
            showButton={false}
          >
            <Offers
              mode="MINE"
            />
          </BaseModule>
          {/**
            * My Listings */}
          <BaseModule
            marginTop="20px"
            sectionTitles={['My Listings']}
            sectionTitlesDescription={['Pods you have listed for sale on the Market']}
            showButton={false}
          >
            <Listings
              mode="MINE"
            />
          </BaseModule>
          {/**
            * My Plots */}
          <BaseModule
            marginTop="20px"
            sectionTitles={['My Plots']}
            sectionTitlesDescription={['']}
            showButton={false}
          >
            <ListTable
              asset={FarmAsset.Pods}
              claimableBalance={harvestablePodBalance}
              claimableCrates={harvestablePlots}
              crates={plots}
              description="Sown Plots will show up here."
              indexTitle="Place in Line"
              index={parseFloat(harvestableIndex)}
              handleChange={(event, p: number) => setPage(p)}
              page={page}
              rowsPerPage={5}
              title="Plots"
            />
          </BaseModule>
        </BaseModule>
      </Grid>
    </Grid>
  );
}
