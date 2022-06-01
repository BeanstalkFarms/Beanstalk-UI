import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { fundsList, FUNDRAISER_LINK } from 'constants/index';
import { Container } from '@mui/material';
import {
  ContentDropdown,
  fundraiserStrings,
  Grid,
} from '../Common';
import FundraiserModule from './FundraiserModule';
import FundraiserTable from './FundraiserTable';

export default function Fundraiser(props) {
  const { fundraisers, hasActiveFundraiser } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const activeFundraisers = [];
  const historicalFundraisers = [];
  const historicalFundraisersInfo = [];

  Object.keys(fundraisers).map((id) => {
    const fundraiser = fundraisers[id];
    const fundraiserInfo = fundsList[id];

    if (fundraiser.remaining.isGreaterThan(0)) {
      activeFundraisers.push(
        <FundraiserModule
          key={id}
          id={id}
          remaining={fundraiser.remaining}
          total={fundraiser.total}
          token={fundraiser.token}
          description={fundraiserInfo.description}
          title={fundraiserInfo.name}
          minHeight={fundsList.length - 1 === id ? '600px' : undefined}
          {...props}
        />
      );
      return activeFundraisers;
    }
      historicalFundraisers.push(fundraiser);
      historicalFundraisersInfo.push(fundraiserInfo);
      return null;
  });

  const descriptionLinks = [
    {
      href: `${FUNDRAISER_LINK}`,
      text: 'Read More',
    },
  ];

  return (
    <Container maxWidth="sm" id="fund">
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={fundraiserStrings.fundsDescription}
          descriptionTitle="What are Fundraisers?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
      <Grid container item>
        <Grid item xs={12}>
          {hasActiveFundraiser ? activeFundraisers : null}
        </Grid>
        <Grid item xs={12}>
          <FundraiserTable
            fundraisers={fundraisers}
            fundraisersInfo={fundsList}
            style={{ maxWidth: '745px', margin: '0 auto' }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
