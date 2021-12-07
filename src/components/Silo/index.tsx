import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { APY_CALCULATION, MEDIUM_INTEREST_LINK, theme } from 'constants/index';
import {
  ContentSection,
  Grid,
  HeaderLabel,
  siloStrings,
  ContentDropdown,
} from 'components/Common';
import { getAPYs } from 'util/index';
import TabbedSilo from './TabbedSilo';

export default function Silo() {
  const { totalStalk, totalSeeds } = useSelector<
    AppState,
    AppState['totalBalance']
  >((state) => state.totalBalance);

  const { farmableWeek } = useSelector<AppState, AppState['beansPerSeason']>(
    (state) => state.beansPerSeason
  );

  const headerLabelStyle = {
    maxWidth: '300px',
    color: theme.text,
  };

  const [beanAPY, lpAPY] = getAPYs(
    farmableWeek,
    parseFloat(totalStalk),
    parseFloat(totalSeeds)
  );
  const apyField = (
    <Grid container item xs={12} spacing={3} justifyContent="center">
      <Grid item sm={6} xs={12} style={headerLabelStyle}>
        <HeaderLabel
          balanceDescription={`${lpAPY.toFixed(2)}%`}
          description={
            <span>
              {siloStrings.lpAPY}{' '}
              <a target="blank" href={APY_CALCULATION}>
                click here
              </a>
            </span>
          }
          title="LP APY"
          value={`${lpAPY.toFixed(0) === '0' ? '–' : lpAPY.toFixed(0)}%`}
        />
      </Grid>
      <Grid item xs={12} sm={6} style={headerLabelStyle}>
        <HeaderLabel
          balanceDescription={`${beanAPY.toFixed(2)}%`}
          description={
            <span>
              {siloStrings.beanAPY}{' '}
              <a target="blank" href={APY_CALCULATION}>
                click here
              </a>
            </span>
          }
          title="Bean APY"
          value={`${beanAPY.toFixed(0) === '0' ? '–' : beanAPY.toFixed(0)}%`}
        />
      </Grid>
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
