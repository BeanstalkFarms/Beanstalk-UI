import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { Box } from '@material-ui/core';
import { BaseModule, Grid, marketStrings, fieldStrings, ListTable, FarmAsset } from 'components/Common';
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
  const [subSection, setSubSection] = useState(0);
  const [page, setPage] = useState(0);
  const sectionTitles = ['Buy Pods', 'Sell Pods'];
  const sectionTitlesDescription = [
    marketStrings.buyPods, // FIXME
    marketStrings.sellPods, // FIXME
  ];
  const sections = [<MarketplaceBuyModule />, <MarketplaceSellModule />];

  const subSectionTitles = [
    'My Offers',
    'My Listings',
  ];
  const subSectionTitlesDescription = [
    'Bids for Pods you\'re willing to buy on the Market',
    'Pods you have listed for sale on the Market',
  ];
  const subSections = [
    <Offers
      mode="MINE"
    />,
    <Listings
      mode="MINE"
    />,
  ];

  const showMyMarketTables = (
    <Box>
      <BaseModule
        handleTabChange={(event, newSubSection) => {
          setSubSection(newSubSection);
        }}
        section={subSection}
        sectionTitles={subSectionTitles}
        sectionTitlesDescription={subSectionTitlesDescription}
        showButton={false}
      >
        {/**
          * My Offers and My Listings */}
        {subSections[subSection]}
      </BaseModule>
    </Box>
  );

  /* My Plots */
  const showPlots = (
    plots !== undefined &&
    (Object.keys(plots).length > 0 || harvestablePodBalance.isGreaterThan(0))
  ) ? (
    <>
      <BaseModule
        section={['']}
        sectionTitles={['My Plots']}
        sectionTitlesDescription={[fieldStrings.plotTable]}
        showButton={false}
      >
        <ListTable
          asset={FarmAsset.Pods}
          claimableBalance={harvestablePodBalance}
          claimableCrates={harvestablePlots}
          crates={plots}
          indexTitle="Place in Line"
          index={parseFloat(harvestableIndex)}
          handleChange={(event, p: number) => setPage(p)}
          page={page}
          title="Plots"
        />
      </BaseModule>
    </>
    )
  : null;

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
          section={0}
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
          {showMyMarketTables}
          {showPlots}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
