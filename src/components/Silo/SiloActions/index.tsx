import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MEDIUM_INTEREST_LINK } from 'constants/index';
import {
  ContentDropdown,
  ContentSection,
  Grid,
  siloStrings
} from 'components/Common';
import TabbedForm from './TabbedForm';

// import the TOKENS array
// grab the :token parameter from react-router
// const token = "bean"; or "bean-eth";
// grab that element from the TOKENS array.

export default function SiloTransaction() {
  const { withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const descriptionLinks = [
    {
      href: `${MEDIUM_INTEREST_LINK}#8b79`,
      text: 'Read More',
    },
  ];

  return (
    <ContentSection id="silo" title="Silo">
      <TabbedForm />
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

SiloTransaction.defaultProps = {
  margin: '-10px 0 -20px 0',
};
