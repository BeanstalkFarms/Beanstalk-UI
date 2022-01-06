import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BaseModule,
  siloStrings,
} from 'components/Common';
import { beanstalkContract } from 'util/index';
import Offers from './Offers';
import CreateListingModule from './CreateListingModule';

export default function MarketplaceSellModule() {
  const [sellOffer, setSellOffer] = useState(null);

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

  const sectionTitles = ['Pod Orders', 'Sell Plot'];
  const sectionTitlesDescription = [
    siloStrings.lpDeposit, // FIXME
    siloStrings.lpDeposit, // FIXME
  ];

  // This only supports eth right now
  // TODO: need to handle beans / beans + eth
  const onCreate = async () => {
    const beanstalk = beanstalkContract();
    const {
      index,
      pricePerPod,
      amount,
    } = sellOffer;

    // TODO: fix expiry
    const expiry = '733593518241';
    const res = await beanstalk.listPlot(
      index.times(10 ** 6).toString(),
      pricePerPod.times(10 ** 6).toString(),
      expiry,
      amount.times(10 ** 6).toString()
    );
    console.log('res:', res);
  };

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
      setSellOffer={setSellOffer}
    />,
  ];

  // Render
  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        handleForm={onCreate}
        handleTabChange={handleTabChange}
        isDisabled={sellOffer == null}
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
