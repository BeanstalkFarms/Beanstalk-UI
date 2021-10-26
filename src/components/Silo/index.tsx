import React from 'react';
import { Link, Box } from '@material-ui/core';
import { MEDIUM_INTEREST_LINK } from '../../constants';
import {
  ContentSection,
  Grid,
  HeaderLabel,
} from '../Common';
import TabbedSilo from './TabbedSilo';
import { getAPYs } from '../../util';

export default function Silo(props) {
  const { innerWidth: width } = window;

  const headerLabelStyle = {
    maxWidth: '300px',
  };

const [beanAPY, lpAPY] = getAPYs(props.beansPerSeason.farmableWeek, parseFloat(props.totalStalk), parseFloat(props.totalSeeds));
const apyField = (
  <Grid container item xs={12} spacing={3} justifyContent="center">
    <Grid item sm={6} xs={12} style={headerLabelStyle}>
      <HeaderLabel
        balanceDescription={`${lpAPY.toFixed(2)}%`}
        description="The LP APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity."
        title="LP APY"
        value={`${lpAPY.toFixed(0)}%`}
      />
    </Grid>
    <Grid item xs={12} sm={6} style={headerLabelStyle}>
      <HeaderLabel
        balanceDescription={`${beanAPY.toFixed(2)}%`}
        description="The Bean APY is a rough estimate based on a liquidity weighted average of Beans minted over the previous 168 Seasons normalized to the current liquidity."
        title="Bean APY"
        value={`${beanAPY.toFixed(0)}%`}
      />
    </Grid>
  </Grid>);
  return (
    <ContentSection id="silo" title="Silo">
      <Box
        className="section-description"
        style={
          width > 500
            ? { maxWidth: '550px', margin: '20px 0 0 0', padding: '12px' }
            : { width: width - 64, margin: '20px 0', padding: '12px' }
        }
      >
        The Silo is the Beanstalk DAO. Silo Members earn passive interest during
        Bean supply increases. Anyone can become a Silo Member by depositing
        Beans or LP Tokens for the BEAN:ETH Uniswap pool in the Silo module
        below in exchange for Stalk and Seeds. The Stalk token entitles holders
        to passive interest in the form of a share of future Bean mints, and the
        right to propose and vote on BIPs. The Seed token yields .0001 Stalk
        every Season. No action is ever required of Silo Members. All Stalk and
        Seeds associated with a Deposit are forfeited upon withdrawal. All
        Withdrawals are frozen for 24 full Seasons.{' '}
        <Link href={`${MEDIUM_INTEREST_LINK}#8b79`} target="blank">
          Read More
        </Link>
        .
      </Box>
      {apyField}
      <TabbedSilo {...props} />
    </ContentSection>
  );
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0',
};
