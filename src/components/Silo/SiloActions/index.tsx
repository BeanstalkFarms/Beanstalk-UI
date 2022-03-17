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
import { SiloToken } from 'constants/siloTokens';

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
    <ContentSection id="silo" title="Silo">
      <TabbedForm tokenData={props.tokenData} />
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

export default SiloActions;