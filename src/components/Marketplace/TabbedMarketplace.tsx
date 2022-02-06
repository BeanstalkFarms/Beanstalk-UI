import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { BaseModule, Grid, marketStrings, fieldStrings, ListTable, FarmAsset } from 'components/Common';
import { PodListing, PodOrder } from 'state/marketplace/reducer';
import MarketplaceBuyModule from './MarketplaceBuyModule';
import MarketplaceSellModule from './MarketplaceSellModule';
import Listings from './Listings/Listings';
import Orders from './Orders/Orders';
import GraphModule from './GraphModule';
import HistoryModule from './HistoryModule';

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

  /** The currently selected listing (used when buying pods). */
  const [currentOrder, setCurrentOrder] = useState<PodOrder | null>(null);
  const [currentListing, setCurrentListing] = useState<PodListing | null>(null);

  //
  const sectionTitles = ['Buy Pods', 'Sell Pods'];
  const sectionTitlesDescription = [
    marketStrings.buyPods,
    marketStrings.sellPods,
  ];
  const sections = [
    <MarketplaceBuyModule
      currentListing={currentListing}
      setCurrentListing={setCurrentListing}
    />,
    <MarketplaceSellModule
      currentOrder={currentOrder}
      setCurrentOrder={setCurrentOrder}
    />
  ];

  const subSectionTitles = ['My Orders', 'My Listings'];
  const subSectionTitlesDescription = [
    marketStrings.myOrders,
    marketStrings.myListings,
  ];
  const subSections = [
    <Orders
      mode="MINE"
      currentOrder={currentOrder}
      setCurrentOrder={setCurrentOrder}
    />,
    <Listings
      mode="MINE"
      currentListing={currentListing}
      setCurrentListing={setCurrentListing}
    />,
  ];

  const showMyMarketTables = (
    <BaseModule
      style={{ marginTop: '20px' }}
      handleTabChange={(event, newSubSection) => {
        setSubSection(newSubSection);
      }}
      section={subSection}
      sectionTitles={subSectionTitles}
      sectionTitlesDescription={subSectionTitlesDescription}
      showButton={false}
    >
      {/**
        * My Orders and My Listings */}
      {subSections[subSection]}
    </BaseModule>
  );

  /* My Plots */
  const showPlots = (
    plots !== undefined &&
    (Object.keys(plots).length > 0 || harvestablePodBalance.isGreaterThan(0))
  ) ? (
    <BaseModule
      style={{ marginTop: '20px' }}
      section={0}
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
    )
  : null;

  const showHistory = (
    <BaseModule
      style={{ marginTop: '20px' }}
      section={0}
      sectionTitles={[]}
      sectionTitlesDescription={[]}
      showButton={false}
    >
      <HistoryModule />
    </BaseModule>
  );

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
        <BaseModule
          section={0}
          sectionTitles={[]}
          sectionTitlesDescription={[]}
          removeBackground
          showButton={false}>
          <GraphModule
            setCurrentListing={setCurrentListing}
            setCurrentOrder={setCurrentOrder}
          />
        </BaseModule>
      </Grid>
      {/* Column: My Market */}
      <Grid
        item
        lg={6}
        md={9}
        sm={12}
        style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
      >
        <BaseModule
          handleTabChange={undefined}
          section={0}
          sectionTitles={['My Market']}
          sectionTitlesDescription={[marketStrings.myMarket]}
          showButton={false}
          removeBackground
        >
          {showMyMarketTables}
          {showPlots}
        </BaseModule>
        <BaseModule
          handleTabChange={undefined}
          section={0}
          sectionTitles={['History']}
          sectionTitlesDescription={[marketStrings.myMarket]}
          showButton={false}
          removeBackground
        >
          {showHistory}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
