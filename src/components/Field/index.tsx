import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { displayBN, displayFullBN } from 'util/index';
import { MEDIUM_INTEREST_LINK, theme } from 'constants/index';
import {
  ContentDropdown,
  Grid,
  HeaderLabelList,
  fieldStrings,
} from 'components/Common';
import { makeStyles } from '@mui/styles';
import MultiCard from 'components/Common/Cards/MultiCard';
import FieldModule from './FieldModule';

const useStyles = makeStyles({
  headerLabelStyle: {
    maxWidth: '250px',
  },
  descriptionImage: {
    verticalAlign: 'middle',
    marginRight: '-1.5px',
    padding: '0 0 4px 0',
  },
  whatIsTheFieldGrid: {
    margin: '20px 0px'
  }
});

const containerStyle = {
  backgroundColor: theme.secondary,
  borderRadius: '15px',
  boxShadow:
    '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
  // width: width > 606 ? '500px' : '250px',
  padding: '0px',
};
const bannerStyle = {
  borderRadius: '15px',
  boxShadow:
    '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
  // width: width > 606 ? '500px' : '250px',
  margin: '10px 0',
  backgroundColor: theme.module.metaBackground,
  padding: '10px',
  display: 'inline-flex',
};

export default function Field() {
  const classes = useStyles();
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const weather = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const {  hasActiveFundraiser } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const description = (
    <>
      The Field is the Beanstalk credit facility. Anyone can lend Beans to
      Beanstalk any time there is Available Soil by sowing Beans in the Field in
      exchange for Pods. Pods are the debt asset of Beanstalk. The Weather
      during the Season Beans are sown determines the number of Pods received
      for each Bean sown. When the Bean supply increases, Pods become redeemable
      for &nbsp;
      <img
        className={classes.descriptionImage}
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
  const fundBox = hasActiveFundraiser ? (
    <Box style={bannerStyle}>
      <span>
        {fieldStrings.activeFundraiser}
        <a href="https://app.bean.money/fundraiser">app.bean.money/fundraiser</a>.
      </span>
    </Box>
  ) : null;

  const leftHeader = (
    <HeaderLabelList
      balanceDescription={[
        `${displayFullBN(weather.soil)} Soil`,
        `${weather.weather}% Weather`,
      ]}
      description={[
        fieldStrings.availableSoil,
        fieldStrings.weather,
      ]}
      title={[
        'Available Soil',
        'Weather',
      ]}
      value={[
        displayBN(weather.soil),
        `${weather.weather.toFixed()}%`,
      ]}
      container={false}
    />
  );
  const rightHeader = (
    <HeaderLabelList
      balanceDescription={[
        `${displayFullBN(totalBalance.totalPods)} Unharvestable Pods`,
        `${displayFullBN(weather.harvestableIndex)} Harvested Pods`,
      ]}
      description={[
        fieldStrings.podLine,
        fieldStrings.podsHarvested,
      ]}
      title={[
        'Pod Line',
        'Pods Harvested',
      ]}
      value={[
        displayBN(totalBalance.totalPods),
        displayBN(weather.harvestableIndex),
      ]}
      container={false}
    />
  );

  return (
    <Container maxWidth="sm">
      <Grid container justifyContent="center">
        {fundBox}
        {/* Field "Analytics" displayed at the top of the page */}
        <Grid item xs="auto" container style={containerStyle}>
          <Grid item xs={12} md={6} className={classes.headerLabelStyle}>
            {leftHeader}
          </Grid>
          <Grid item xs={12} md={6} className={classes.headerLabelStyle}>
            {rightHeader}
          </Grid>
        </Grid>
        {/* Content */}
        <MultiCard type="meta">
          <FieldModule />
        </MultiCard>
        <div className={classes.whatIsTheFieldGrid}>
          <ContentDropdown
            description={description}
            descriptionTitle="What is the Field?"
            descriptionLinks={descriptionLinks}
          />
        </div>
      </Grid>
    </Container>
  );
}
