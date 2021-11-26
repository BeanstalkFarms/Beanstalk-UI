import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { fundsList } from 'constants/index';
import { ContentSection, fundraiserStrings } from '../Common';
import FundraiserModule from './FundraiserModule';

export default function Fundraiser(props) {
  const { fundraisers, hasActiveFundraiser } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

const funds = (
    Object.keys(fundraisers).map((id) => {
      const fundraiser = fundraisers[id];
      const fundraiserInfo = fundsList[id];

      return (
        <FundraiserModule
          key={id}
          id={id}
          remaining={fundraiser.remaining}
          total={fundraiser.total}
          token={fundraiser.token}
          description={fundraiserInfo.description}
          title={fundraiserInfo.name}
          minHeight={fundsList.length - 1 === id ? '600px' : undefined}
          {...props}
        />
      );
    })
  );

  if (hasActiveFundraiser) {
    return (
      <ContentSection id="fund" title="Fundraiser" description={fundraiserStrings.fundsDescription}>
        {funds}
      </ContentSection>
    );
  }
  return null;
}
