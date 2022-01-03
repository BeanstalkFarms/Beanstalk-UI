import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BaseModule,
  siloStrings,
} from 'components/Common';
import Offers from './Offers';
import CreateListingModule from './CreateListingModule';

export default function MarketplaceSellModule() {
  // Global state
  const {
    harvestablePodBalance,
    plots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // Local state
  const [section, setSection] = useState(0);

  // Handlers
  const handleTabChange = (event, newSection) => {
    setSection(newSection);
  };

  const sectionTitles = ['Offers', 'Sell Plot'];
  const sectionTitlesDescription = [
    siloStrings.lpDeposit, // FIXME
    siloStrings.lpDeposit, // FIXME
  ];

  const sections = [
    <Offers
    />,
    <CreateListingModule
      plots={plots}
      hasPlots={
        plots !== undefined &&
        (Object.keys(plots).length > 0 ||
          harvestablePodBalance.isGreaterThan(0))
      }
      index={parseFloat(harvestableIndex)}
    />,
  ];

  // Render
  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        handleForm={() => {}}
        handleTabChange={handleTabChange}
        isDisabled={false}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        showButton={section === 1}
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
