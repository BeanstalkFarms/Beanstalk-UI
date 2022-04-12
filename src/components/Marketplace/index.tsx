import React from 'react';
import { MEDIUM_INTEREST_LINK } from 'constants/index';
import {
  ContentDropdown,
  ContentSection,
  Grid,
  marketStrings,
} from 'components/Common';
import TabbedMarketplace from './TabbedMarketplace';

export default function Marketplace() {
  // FIXME: Add Marketplace medium link
  const descriptionLinks = [
    {
      href: `${MEDIUM_INTEREST_LINK}#8b79`,
      text: 'Read More',
    },
  ];

  return (
    <ContentSection id="market">
      <TabbedMarketplace />
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={marketStrings.description}
          descriptionTitle="What is the Marketplace?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
    </ContentSection>
  );
}

Marketplace.defaultProps = {
  margin: '-10px 0 -20px 0',
};
