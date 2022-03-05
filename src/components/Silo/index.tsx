import React from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { APY_CALCULATION, BEAN_TO_SEEDS, BEAN_TO_STALK, MEDIUM_INTEREST_LINK, theme } from 'constants/index';
import {
  BaseModule,
  ContentDropdown,
  ContentSection,
  Grid,
  HeaderLabelList, marketStrings,
  siloStrings,
  // HeaderLabelList,
} from 'components/Common';
import { CryptoAsset, displayBN, getAPYs } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import TokenDataTable from "./TokenDataTable";

const headerLabelStyle = {
  maxWidth: '300px',
  color: theme.text,
  padding: '0px',
};

// Whitelisted tokens that can be deposited into the Silo
const TOKENS = {
  // Bean
  'bean': {
    name: 'Bean',
    slug: 'bean', // /farm/silo/bean-eth
    rewards: {
      stalk: BEAN_TO_STALK,
      seeds: BEAN_TO_SEEDS,
    },
    siloed: new BigNumber(10), // test
    getAPY: (apys: ReturnType<typeof getAPYs>) => {
      return apys[0]; // Bean
    },
    getTotalBalance: (totalBalances: AppState['totalBalance']) => {
      return {
        siloed: totalBalances.totalBeans,
      };
    },
    getUserBalance: (userBalances: AppState['userBalance']) => {
      return {
        siloed: userBalances.beanSiloBalance
      }
    }
  }
}


// React component
const TokenRow = (props) => {
  return (
    <div>
      APY: {props.apy}
      totalBalance: {props.totalBalance}
      ...
    </div>
  );
}

export default function Silo() {
  // Hide APY's for now since they are misleading
  // Fetch and calculate APYs
  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );
  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const {
    beanSiloBalance,
    beanClaimableBalance,
    stalkBalance,
    grownStalkBalance
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  // on each render, grab APY array
  const apys = getAPYs(
    farmableMonth,
    parseFloat(totalBalance.totalStalk),
    parseFloat(totalBalance.totalSeeds)
  );

  const [beanAPY, lpAPY] = apys;

  //
  const metrics = (
    <>
      <Grid item lg={4} sm={12}>
        {/* Metrics card: APYs */}
        <HeaderLabelList
          title={[
            'Bean APY',
            'LP APY',
          ]}
          value={[
            `${beanAPY.toFixed(0) === '0' ? '–' : beanAPY.toFixed(0)}%`,
            `${lpAPY.toFixed(0) === '0' ? '–' : lpAPY.toFixed(0)}%`,
          ]}
          description={[
            <span>
              {siloStrings.beanAPY}{' '}
              <a target="blank" href={APY_CALCULATION}>
                click here
              </a>
            </span>,
            <span>
              {siloStrings.lpAPY}{' '}
              <a target="blank" href={APY_CALCULATION}>
                click here
              </a>
            </span>,
          ]}
          balanceDescription={[
            `${beanAPY.toFixed(2)}%`,
            `${lpAPY.toFixed(2)}%`,
          ]}
          width="100%"
        />
      </Grid>
      <Grid item lg={4} sm={12}>
        {/* Metrics card: TVL/30-day */}
        <HeaderLabelList
          title={[
            'TVL',
            '30 Day Interest',
          ]}
          value={[
            <span>
              ${displayBN(totalBalance.totalSiloBeans)}
            </span>,
            <span>
              {displayBN(new BigNumber(604622))}
            </span>,
          ]}
          description={[
            <span>
              desc
            </span>,
            <span>
              desc
            </span>,
          ]}
          balanceDescription={[
            ``,
            ``,
          ]}
          width="100%"
        />
      </Grid>
      <Grid item lg={4} sm={12}>
        {/* Metrics card: My Balances */}
        <HeaderLabelList
          // containerTitle="Balances"
          title={[
            'My Beans',
            'My Stalk',
          ]}
          value={[
            <span>
              ${displayBN(beanSiloBalance.div(10))}
            </span>,
            <span>
              {displayBN(stalkBalance.div(10))}
            </span>,
          ]}
          description={[
            <span>
              desc
            </span>,
            <span>
              desc
            </span>,
          ]}
          balanceDescription={[
            ``,
            ``,
          ]}
          width="100%"
        />
      </Grid>
      {/* Select a silo */}
    </>
  );



  return (
    <>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} lg={8} container spacing={2}>
          {metrics}
        </Grid>
        <Grid item xs={12} sm={10} lg={8} container justifyContent="center">
          <BaseModule
            section={0}
            sectionTitles={[]}
            sectionTitlesDescription={[]}
            showButton={false}
            normalBox={false}
            // removeBackground
            style={{ display: "block", width: "100%" }}
            margin="0"
          >
            {/* <TokenDataTable tokens={TOKENS} /> */}
            <div>
              {Object.values(TOKENS).map(token => {
                return (
                  <div>
                    Name: {token.name}<br/>
                    APY: {token.getAPY(apys)}
                    How many Beans are in the Silo? {token.getTotalBalance(totalBalance)}
                  </div>
                )
              })}
              <TokenRow
                name="Bean"
                apy={apys[0]} // Bean APY
                totalBalance={totalBalance.totalBeans}
              />
            </div>
          </BaseModule>
          {/*<TokenDataTable tokens={TOKENS} />*/}




          {/*<BaseModule*/}
          {/*  section={0}*/}
          {/*  sectionTitles={[]}*/}
          {/*  sectionTitlesDescription={[]}*/}
          {/*  showButton={false}*/}
          {/*  normalBox={false}*/}
          {/*  removeBackground*/}
          {/*  style={{ display: "block", width: "100%" }}*/}
          {/*  margin="0"*/}
          {/*>*/}
          {/*  <BaseModule*/}
          {/*    section={0}*/}
          {/*    sectionTitles={[]}*/}
          {/*    sectionTitlesDescription={[]}*/}
          {/*    showButton={false}*/}
          {/*    normalBox={false}*/}
          {/*    // removeBackground*/}
          {/*    style={{ display: "block", width: "100%" }}*/}
          {/*    margin="0"*/}
          {/*>*/}
          {/*    <TokenRowModule />*/}
          {/*  </BaseModule>*/}



          {/*</BaseModule>*/}




        </Grid>

        {/*<BaseModule*/}
        {/*  handleTabChange={undefined}*/}
        {/*  section={0}*/}
        {/*  sectionTitles={['History']}*/}
        {/*  sectionTitlesDescription={[marketStrings.history]}*/}
        {/*  showButton={false}*/}
        {/*  removeBackground*/}
        {/*>*/}
        {/*  {showStats}*/}
        {/*  {showHistory}*/}
        {/*</BaseModule>*/}


      </Grid>
      {/* Silos */}
      {/* <HeaderLabelList
        description={[
          siloStrings.withdrawSeasons,
          siloStrings.decreaseSeasons,
        ]}
        balanceDescription={[
          `${withdrawSeasons} Seasons`,
          `${nextDecrease} Seasons`,
        ]}
        title={[
          'Withdraw Seasons',
          'Next Decrease',
        ]}
        value={[
          `${withdrawSeasons}`,
          `${nextDecrease}`,
        ]}
      /> */}
      {/* <TabbedSilo /> */}
      {/* <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={siloStrings.siloDescription.replace('{0}', withdrawSeasons)}
          descriptionTitle="What is the Silo?"
          descriptionLinks={descriptionLinks}
        />
      </Grid> */}
    </>
  );
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0',
};



  // const descriptionLinks = [
  //   {
  //     href: `${MEDIUM_INTEREST_LINK}#8b79`,
  //     text: 'Read More',
  //   },
  // ];

  // const nextDecrease = withdrawSeasons.isGreaterThan(13) ?
  //   (new BigNumber(84)).minus(season.mod(84)) :
  //   (withdrawSeasons.isGreaterThan(5) ?
  //   (new BigNumber(168)).minus(season.mod(168)) :
  //   'na');

  /* <TokenIcon
    token={CryptoAsset.Bean}
    style={{
      display: "inline-block",
      filter: "invert(100%)",
      // color: "white",
      opacity: 1
    }}
  /> */