import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { displayBN, displayFullBN } from 'util/index';
import { APY_CALCULATION, MEDIUM_INTEREST_LINK, theme } from 'constants/index';
import {
  BaseModule,
  ContentDropdown,
  ContentSection,
  Grid,
  HeaderLabelList,
  fieldStrings,
} from 'components/Common';
import FieldModule from './FieldModule';

export default function Field() {
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const weather = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const beansPerSeason = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  //
  const headerLabelStyle = {
    maxWidth: '250px',
  };
  const containerStyle = {
    backgroundColor: theme.secondary,
    borderRadius: '15px',
    boxShadow:
      '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
    width: width > 606 ? '500px' : '250px',
    padding: '0px',
  };

  //
  const tth = totalBalance.totalPods.dividedBy(beansPerSeason.harvestableMonth);
  const apy = weather.weather.multipliedBy(8760).dividedBy(tth);

  const description = (
    <>
      The Field is the Beanstalk credit facility. Anyone can lend Beans to
      Beanstalk anytime there is Available Soil by sowing Beans in the Field in
      exchange for Pods. Pods are the debt asset of Beanstalk. The Weather
      during the Season Beans are sown determines the number of Pods received
      for each Bean sown. When the Bean supply increases, Pods become redeemable
      for &nbsp;
      <img
        style={{
          verticalAlign: 'middle',
          marginRight: '-1.5px',
          padding: '0 0 4px 0',
        }}
        height="17px"
        src={theme.bean}
        alt="Beans"
      />
      1 each on a FIFO basis.
    </>
  );

  const descriptionLinks = [
    {
      href: `${MEDIUM_INTEREST_LINK}#0b33`,
      text: 'Read More',
    },
  ];

  const leftHeader = (
    <HeaderLabelList
      balanceDescription={[
        `${displayFullBN(weather.soil)} Soil`,
        `${weather.weather}% Weather`,
        `${apy.toFixed(2)}% APY`,
      ]}
      description={[
        fieldStrings.availableSoil,
        fieldStrings.weather,
        <span>
          {fieldStrings.podAPY}{' '}
          <a target="blank" href={APY_CALCULATION}>
            click here
          </a>
        </span>,
      ]}
      title={[
        'Available Soil',
        'Weather',
        'Pod APY',
      ]}
      value={[
        displayBN(weather.soil),
        `${weather.weather.toFixed()}%`,
        `${apy.toFixed(0) === '0' ? '–' : apy.toFixed(0)}%`,
      ]}
      container={false}
    />
  );
  const rightHeader = (
    <HeaderLabelList
      balanceDescription={[
        `${displayFullBN(totalBalance.totalPods)} Unharvestable Pods`,
        `${displayFullBN(weather.harvestableIndex)} Harvested Pods`,
        `${tth.toFixed(2)} Seasons`,
      ]}
      description={[
        fieldStrings.podLine,
        fieldStrings.podsHarvested,
        <span>
          {fieldStrings.seasonsToPodClearance}{' '}
          <a target="blank" href={APY_CALCULATION}>
            click here
          </a>
        </span>,
      ]}
      title={[
        'Pod Line',
        'Pods Harvested',
        'Pod Clearance',
      ]}
      value={[
        displayBN(totalBalance.totalPods),
        displayBN(weather.harvestableIndex),
        `${tth.toFixed(0) === 'Infinity' ? '–' : tth.toFixed(0)}`,
      ]}
      container={false}
    />
  );

  return (
    <ContentSection
      id="field"
      title="Field"
    >
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={description}
          descriptionTitle="What is the Field?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
      <Grid container item justifyContent="center" style={containerStyle}>
        <Grid item md={12} lg={6} style={headerLabelStyle}>
          {leftHeader}
        </Grid>
        <Grid item md={12} lg={6} style={headerLabelStyle}>
          {rightHeader}
        </Grid>
      </Grid>
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
            section={0}
            sectionTitles={['']}
            sectionTitlesDescription={['']}
            showButton={false}
            removeBackground
            normalBox={false}
          >
            <FieldModule />
          </BaseModule>
        </Grid>
      </Grid>
    </ContentSection>
  );
}
