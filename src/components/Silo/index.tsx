import React from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MEDIUM_INTEREST_LINK } from 'constants/index';
import {
  ContentDropdown,
  ContentSection,
  Grid,
  HeaderLabelList,
  siloStrings,
  // HeaderLabelList,
} from 'components/Common';
// import { getAPYs } from 'util/index';
import TabbedSilo from './TabbedSilo';

// const headerLabelStyle = {
//   maxWidth: '300px',
//   color: theme.text,
//   padding: '0px',
// };

export default function Silo() {
  // Hide APY's for now since they are misleading
  // Fetch and calculate APYs
  // const { totalStalk, totalSeeds } = useSelector<AppState, AppState['totalBalance']>(
  //   (state) => state.totalBalance
  // );
  const { withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  // const [beanAPY, lpAPY] = getAPYs(
  //   farmableMonth,
  //   parseFloat(totalStalk),
  //   parseFloat(totalSeeds)
  // );

  // const apyField = (
  //   <Grid container item xs={12} justifyContent="center" style={headerLabelStyle}>
  //     <HeaderLabelList
  //       balanceDescription={[
  //         `${lpAPY.toFixed(2)}%`,
  //         `${beanAPY.toFixed(2)}%`,
  //       ]}
  //       description={[
  //         <span>
  //           {siloStrings.lpAPY}{' '}
  //           <a target="blank" href={APY_CALCULATION}>
  //             click here
  //           </a>
  //         </span>,
  //         <span>
  //           {siloStrings.beanAPY}{' '}
  //           <a target="blank" href={APY_CALCULATION}>
  //             click here
  //           </a>
  //         </span>,
  //       ]}
  //       title={[
  //         'LP APY',
  //         'Bean APY',
  //       ]}
  //       value={[
  //         `${lpAPY.toFixed(0) === '0' ? '–' : lpAPY.toFixed(0)}%`,
  //         `${beanAPY.toFixed(0) === '0' ? '–' : beanAPY.toFixed(0)}%`,
  //       ]}
  //       width="300px"
  //     />
  //   </Grid>
  // );

  const descriptionLinks = [
    {
      href: `${MEDIUM_INTEREST_LINK}#8b79`,
      text: 'Read More',
    },
  ];

  const nextDecrease = withdrawSeasons.isGreaterThan(13) ?
    (new BigNumber(84)).minus(season.mod(84)) :
    (withdrawSeasons.isGreaterThan(5) ?
    (new BigNumber(168)).minus(season.mod(168)) :
    'na');

  return (
    <ContentSection id="silo" title="Silo">
      {/* apyField hidden for now */}

      <HeaderLabelList
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
      />
      <TabbedSilo />
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={siloStrings.siloDescription.replace('{0}', withdrawSeasons)}
          descriptionTitle="What is the Silo?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
    </ContentSection>
  );
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0',
};
