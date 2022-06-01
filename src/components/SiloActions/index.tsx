import React from 'react';
import { useSelector } from 'react-redux';
import { Container } from '@mui/material';

import { AppState } from 'state';
import { MEDIUM_INTEREST_LINK } from 'constants/index';
import {
  ContentDropdown,
  Grid,
  siloStrings
} from 'components/Common';
import { SiloToken } from 'constants/v0/siloTokens';
import TabbedForm from './TabbedForm';

const descriptionLinks = [
  {
    href: `${MEDIUM_INTEREST_LINK}#8b79`,
    text: 'Read More',
  },
];

type SiloActionsProps = {
  tokenData: SiloToken;
}

const SiloActions : React.FC<SiloActionsProps> = (props) => {
  const { withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  return (
    <Container maxWidth="sm">
      {/* Tabbed Silo form with 2-3 actions depending on token */}
      <TabbedForm
        tokenData={props.tokenData}
      />
      {/* Description */}
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={siloStrings.siloDescription.replace('{0}', withdrawSeasons)}
          descriptionTitle="What is the Silo?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
    </Container>
  );
};

export default SiloActions;
