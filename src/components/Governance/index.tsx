import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Link, Box } from '@material-ui/core';
import GovernanceTable from './GovernanceTable';
import Vote from './Vote';
import { ContentSection, Grid } from '../Common';
import { WHITEPAPER } from '../../constants';

export default function Governance() {
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

  if (bips === undefined || bips.length === 0) return null;

  const activeBipStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '16px',
    marginTop: '10px',
    width: '100%',
  };

  const activeBips = bips.reduce((aBips, bip) => {
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
    sBips[bip] = bips[bip].period.minus(season.minus(bips[bip].start));
    return sBips;
  }, {});

  const voteField =
    activeBips.length > 0 ? (
      <Grid item md={6} xs={12} style={{ maxWidth: '550px', margin: 'auto' }}>
        <Vote
          bips={activeBips}
          seasonBips={seasonBips}
          stalkBips={stalkBips}
          totalRoots={totalRoots}
          userRoots={rootsBalance}
          votedBips={_votedBips}
        />
      </Grid>
    ) : (
      <Box style={activeBipStyle}>No Active BIPs</Box>
    );

  const description = (
    <>
      Beanstalk is upgraded in a decentralized fashion through Beanstalk
      Improvement Proposals (BIPs). Anyone with more than .1% of the total
      outstanding Stalk can propose a BIP. Any Stalk holder can vote for a BIP.
      BIPs can be committed in as little as 24 Seasons with a 2/3 supermajority,
      or after 168 Seasons with a 1/2 majority.{' '}
      <Link href={`${WHITEPAPER}#governance`} target="blank">
        Read More
      </Link>
      .
    </>
  );

  return (
    <ContentSection
      id="governance"
      title="Governance"
      size="20px"
      description={description}
    >
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid
          container
          item
          sm={12}
          xs={12}
          alignItems="flex-start"
          justifyContent="center"
          style={{ minHeight: '200px' }}
        >
          <Grid item xs={12}>
            {voteField}
          </Grid>
          <Grid item xs={12}>
            <GovernanceTable
              bips={bips}
              season={season}
              totalRoots={totalRoots}
              style={{ maxWidth: '745px', margin: '0 auto' }}
            />
          </Grid>
        </Grid>
      </Grid>
    </ContentSection>
  );
}
