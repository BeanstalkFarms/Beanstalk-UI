import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { AppState } from 'state';
import {
  ContentDropdown,
  ContentTitle,
  governanceStrings,
  Grid,
} from 'components/Common';
import { WHITEPAPER } from 'constants/index';
import { BIP } from 'state/general/reducer';

import Fundraiser from '../Fundraiser';
import BipTable from './BipTable';
import Vote from './Vote';

const useStyles = makeStyles({
  activeBipStyle: {
    fontFamily: 'Futura-PT-Book',
    fontSize: '16px',
    marginTop: '10px',
    width: '100%',
  },
  voteGrid: {
    maxWidth: '550px',
    margin: 'auto'
  },
  helperGrid: {
    margin: '20px 0px'
  }
});

export default function Governance() {
  const classes = useStyles();
  const { bips } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );

  const { totalRoots } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { rootsBalance, votedBips } = useSelector<
    AppState,
    AppState['userBalance']
  >((state) => state.userBalance);

  const { hasActiveFundraiser } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  if (bips === undefined || bips.length === 0) return null;

  //
  const activeBips : (BIP['id'])[] = bips.reduce((aBips, bip) => {
    if (bip.active) aBips.push(bip.id.toString());
    return aBips;
  }, []);
  const _votedBips = activeBips.reduce((vBips, bip) => {
    vBips[bip] = votedBips.has(bip);
    return vBips;
  }, {});
  const stalkBips = activeBips.reduce((sBips, bip) => {
    sBips[bip] = bips[bip].roots;
    return sBips;
  }, {});
  const seasonBips = activeBips.reduce((sBips, bip) => {
    sBips[bip] = bips[bip].period.minus(season.minus(bips[bip].start).minus(1));
    return sBips;
  }, {});

  const voteField =
    activeBips.length > 0 ? (
      <Grid item md={6} xs={12} className={classes.voteGrid}>
        <Vote
          bips={activeBips}
          seasonBips={seasonBips}
          stalkBips={stalkBips}
          totalRoots={totalRoots}
          votedBips={_votedBips}
          userRoots={rootsBalance}
        />
      </Grid>
    ) : (
      <Box className={classes.activeBipStyle}>No Active BIPs</Box>
    );

  const descriptionLinks = [
    {
      href: `${WHITEPAPER}#governance`,
      text: 'Read More',
    },
  ];

  return (
    <Container maxWidth="md">
      <Grid container item xs={12} rowSpacing={12} justifyContent="center">
        {/* Section: BIPs */}
        <Grid
          item
          xs={12}
          container
          rowSpacing={4}
          alignItems="flex-start"
          justifyContent="center"
        >
          {/* Active BIPs */}
          <Grid item xs={12}>
            {voteField}
          </Grid>
          {/* Past BIPs */}
          <Grid item xs={12}>
            <BipTable
              bips={bips}
              season={season}
              totalRoots={totalRoots}
            />
          </Grid>
        </Grid>
        {/* Section: Fundraiser */}
        {hasActiveFundraiser ? (
          <Grid
            item
            xs={12}
            container
            rowSpacing={4}
            alignItems="flex-start"
            justifyContent="center"
          >
            <ContentTitle title="Fundraisers" />
            <Fundraiser />
          </Grid>
        ) : null}
      </Grid>
      <Grid container justifyContent="center" className={classes.helperGrid}>
        <ContentDropdown
          description={governanceStrings.governanceDescription}
          descriptionTitle="How do I participate in Governance?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
    </Container>
  );
}
