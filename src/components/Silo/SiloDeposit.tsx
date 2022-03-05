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
  siloStrings
} from 'components/Common';
import TabbedSilo from './TabbedSilo';

// import the TOKENS array
// grab the :token parameter from react-router
// const token = "bean"; or "bean-eth";
// grab that element from the TOKENS array.

export default function Silo() {
  const { withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );

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
