import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { APY_CALCULATION, MEDIUM_INTEREST_LINK, theme } from 'constants/index';
import {
  ContentDropdown,
  ContentSection,
  Grid,
  siloStrings,
  HeaderLabelList,
} from 'components/Common';
import { getAPYs } from 'util/index';
import TabbedSilo from './TabbedSilo';

export default function Silo() {
  const { totalStalk, totalSeeds } = useSelector<
    AppState,
    AppState['totalBalance']
  >((state) => state.totalBalance);

  const { farmableMonth } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );

  const headerLabelStyle = {
    maxWidth: '300px',
    color: theme.text,
    padding: '0px',
  };

  const [beanAPY, lpAPY] = getAPYs(
    farmableMonth,
    parseFloat(totalStalk),
    parseFloat(totalSeeds)
  );
  const apyField = (
    <Grid container item xs={12} justifyContent="center" style={headerLabelStyle}>
      <HeaderLabelList
        balanceDescription={[
          `${lpAPY.toFixed(2)}%`,
          `${beanAPY.toFixed(2)}%`,
        ]}
        description={[
          <span>
            {siloStrings.lpAPY}{' '}
            <a target="blank" href={APY_CALCULATION}>
              click here
            </a>
          </span>,
          <span>
            {siloStrings.beanAPY}{' '}
            <a target="blank" href={APY_CALCULATION}>
              click here
            </a>
          </span>,
        ]}
        title={[
          'LP APY',
          'Bean APY',
        ]}
        value={[
          `${lpAPY.toFixed(0) === '0' ? '–' : lpAPY.toFixed(0)}%`,
          `${beanAPY.toFixed(0) === '0' ? '–' : beanAPY.toFixed(0)}%`,
        ]}
      />
    </Grid>
  );

  const descriptionLinks = [
    {
      href: `${MEDIUM_INTEREST_LINK}#8b79`,
      text: 'Read More',
    },
  ];

  return (
    <>
      <ContentSection
        id="silo"
        title="Silo"
      >
        <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
          <ContentDropdown
            description={siloStrings.siloDescription}
            descriptionTitle="What is the Silo?"
            descriptionLinks={descriptionLinks}
          />
        </Grid>
        {apyField}
        <TabbedSilo />
      </ContentSection>
    </>
  );
}

Silo.defaultProps = {
  margin: '-10px 0 -20px 0',
};
