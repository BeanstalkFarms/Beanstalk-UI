import React from 'react';
import { Link, Box } from '@material-ui/core';
import { WHITEPAPER } from '../../constants';
import { ContentSection, Grid } from '../Common';
import GovernanceTable from './GovernanceTable';
import Vote from './Vote';

export default function Governance(props) {
  if (props.bips === undefined || props.bips.length === 0) return null;

  const activeBipStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '16px',
    marginTop: '10px',
    width: '100%',
  };

  const activeBips = props.bips.reduce((aBips, bip) => {
    if (bip.active) aBips.push(bip.id.toString());
    return aBips;
  }, []);
  const votedBips = activeBips.reduce((vBips, bip) => {
    vBips[bip] = props.votedBips.has(bip);
    return vBips;
  }, {});
  const stalkBips = activeBips.reduce((sBips, bip) => {
    sBips[bip] = props.bips[bip].roots;
    return sBips;
  }, {});
  const seasonBips = activeBips.reduce((sBips, bip) => {
    sBips[bip] = props.bips[bip].period.minus(
      props.season.minus(props.bips[bip].start).minus(1)
    );
    return sBips;
  }, {});

  const voteField =
    activeBips.length > 0 ? (
      <Grid item md={6} xs={12} style={{ maxWidth: '550px', margin: 'auto' }}>
        <Vote
          bips={activeBips}
          seasonBips={seasonBips}
          stalkBips={stalkBips}
          totalRoots={props.totalRoots}
          userRoots={props.userRoots}
          votedBips={votedBips}
        />
      </Grid>
    ) : (
      <Box style={activeBipStyle}>No Active BIPs</Box>
    );

  const description = (
    <>
      Beanstalk is upgraded in a decentralized fashion through Beanstalk Improvement Proposals (BIPs). Anyone with more than .1% of the total outstanding Stalk can propose a BIP. Any Stalk holder can vote for a BIP. BIPs can be committed in as little as 24 Seasons with a 2/3 supermajority, or after 168 Seasons with a 1/2 majority.
      {' '}<Link href={`${WHITEPAPER}#governance`} target="blank">Read More</Link>.
    </>
  );

  return (
    <ContentSection id="governance" title="Governance" size="20px" style={{ minHeight: '600px' }} description={description}>
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
              {...props}
              style={{ maxWidth: '745px', margin: '0 auto' }}
            />
          </Grid>
        </Grid>
      </Grid>
    </ContentSection>
  );
}
