import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { fundsList } from 'constants/index';
import { ContentSection, fundraiserStrings } from '../Common';
import FundraiserModule from './FundraiserModule';
import FundraiserTable from './FundraiserTable';

export default function Fundraiser(props) {
  const { fundraisers, hasActiveFundraiser } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const activeFundraisers = [];
  const historicalFundraisers = [];
  const historicalFundraisersInfo = [];

  Object.keys(fundraisers).map((id) => {
    const fundraiser = fundraisers[id];
    const fundraiserInfo = fundsList[id];

    if (fundraiser.remaining.isGreaterThan(0)) {
      activeFundraisers.push(
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
      return activeFundraisers;
    }
      historicalFundraisers.push(fundraiser);
      historicalFundraisersInfo.push(fundraiserInfo);
      return null;
  });

  return (
    <ContentSection id="fund" title="Fundraiser" description={fundraiserStrings.fundsDescription}>
      {hasActiveFundraiser ? activeFundraisers : null}
      <FundraiserTable
        fundraisers={historicalFundraisers}
        fundraisersInfo={historicalFundraisersInfo}
        style={{ maxWidth: '745px', margin: '0 auto' }}
      />
    </ContentSection>
  );
}
