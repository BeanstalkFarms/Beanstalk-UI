import React from 'react';
import { Link, Box, Button, makeStyles } from '@material-ui/core';
import { setHideShowState } from 'state/hideShowHandler/actions';
import { AppState } from 'state';
import { useDispatch, useSelector } from 'react-redux';
import GovernanceTable from './GovernanceTable';
import Vote from './Vote';
import { ContentSection, Grid } from '../Common';
import { WHITEPAPER } from '../../constants';

export default function Governance(props) {
  const dispatch = useDispatch();

  const hideShowState = useSelector<AppState, AppState['hideShowHandler']>(
    (state) => state.hideShowHandler
  );

  if (props.bips === undefined || props.bips.length === 0) return null;

  const activeBipStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '16px',
    marginTop: '10px',
    width: '100%',
  };

  const classes = makeStyles(() => ({
    hideButton: {
      borderRadius: '15px',
      fontFamily: 'Futura-Pt-Book',
      fontSize: 'calc(12px + 1vmin)',
      height: '44px',
      margin: '20px 0 10px',
      width: '200px',
    },
  }))();

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
      props.season.minus(props.bips[bip].start)
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

  const buttonHandler = () => {
    dispatch(
      setHideShowState({
        governance: !hideShowState.governance,
      })
    );
  };

  const hideButton = (
    <Button
      className={classes.hideButton}
      color="primary"
      onClick={buttonHandler}
      variant="text"
    >
      {hideShowState.governance ? 'SHOW' : 'HIDE'}
    </Button>
  );

  const description = hideShowState.governance ? (
    <>{hideButton}</>
  ) : (
    <>
      Beanstalk is upgraded in a decentralized fashion through Beanstalk
      Improvement Proposals (BIPs). Anyone with more than .1% of the total
      outstanding Stalk can propose a BIP. Any Stalk holder can vote for a BIP.
      BIPs can be committed in as little as 24 Seasons with a 2/3 supermajority,
      or after 168 Seasons with a 1/2 majority.{' '}
      <Link href={`${WHITEPAPER}#governance`} target="blank">
        Read More
      </Link>
      .{hideButton}
    </>
  );

  return (
    <ContentSection
      id="governance"
      title="Governance"
      size="20px"
      style={{ minHeight: '333px' }}
      description={description}
    >
      <Grid container item xs={12} spacing={3} justifyContent="center">
        {hideShowState.governance ? (
          <></>
        ) : (
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
        )}
      </Grid>
    </ContentSection>
  );
}
