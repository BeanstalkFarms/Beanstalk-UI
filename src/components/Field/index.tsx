import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { displayBN, displayFullBN } from '../../util';
import { APY_CALCULATION, MEDIUM_INTEREST_LINK, theme } from '../../constants';
import { BaseModule, ContentSection, Grid, HeaderLabel, fieldStrings } from '../Common';
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

  const { innerWidth: width } = window;

  const headerLabelStyle = {
    maxWidth: '300px',
  };

  const tth = totalBalance.totalPods.dividedBy(beansPerSeason.harvestableWeek);
  const apy = weather.weather.multipliedBy(8760).dividedBy(tth);

  const apyField = (
    <Grid container item xs={12} spacing={3} justifyContent="center">
      <Grid item sm={6} xs={12} style={headerLabelStyle}>
        <HeaderLabel
          balanceDescription={`${apy.toFixed(2)}% APY`}
          description={
            <span>
              {fieldStrings.podAPY}{' '}
              <a target="blank" href={APY_CALCULATION}>
                click here
              </a>
            </span>
          }
          title="Pod APY"
          value={`${apy.toFixed(0) === '0' ? '–' : apy.toFixed(0)}%`}
        />
      </Grid>
      <Grid item sm={6} xs={12} style={headerLabelStyle}>
        <HeaderLabel
          balanceDescription={`${tth.toFixed(2)} Seasons`}
          description={
            <span>
              {fieldStrings.seasonsToPodClearance}{' '}
              <a target="blank" href={APY_CALCULATION}>
                click here
              </a>
            </span>
          }
          title="Seasons to Pod Clearance"
          value={tth.toFixed(0) === 'Infinity' ? '–' : tth.toFixed(0)}
        />
      </Grid>
    </Grid>
  );

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

  return (
    <ContentSection
      id="field"
      title="Field"
      description={description}
      descriptionLinks={descriptionLinks}
    >
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(weather.soil)} Soil`}
            description={fieldStrings.availableSoil}
            title="Available Soil"
            value={displayBN(weather.soil)}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(
              totalBalance.totalPods
            )} Unharvestable Pods`}
            description={fieldStrings.podLine}
            title="Pod Line"
            value={displayBN(totalBalance.totalPods)}
          />
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${weather.weather}% Weather`}
            description={fieldStrings.weather}
            title="Weather"
            value={`${weather.weather.toFixed()}%`}
          />
        </Grid>
        <Grid item sm={6} xs={12} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(
              weather.harvestableIndex
            )} Harvested Pods`}
            description={fieldStrings.podsHarvested}
            title="Pods Harvested"
            value={displayBN(weather.harvestableIndex)}
          />
        </Grid>
      </Grid>
      {apyField}
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
