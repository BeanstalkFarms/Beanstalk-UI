import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { Listing } from 'state/marketplace/reducer';
import {
  BaseModule,
  marketStrings,
} from 'components/Common';
import { beanstalkContract } from 'util/index';

import Offers from './Offers/Offers';
import CreateListingModule from './Listings/CreateListingModule';

type SellOfferState = {
  /** */
  index: Listing['objectiveIndex'];
  /** */
  pricePerPod: Listing['pricePerPod'];
  /** */
  amount: Listing['initialAmount'];
  /** */
  expiresIn: Listing['expiresIn'];
}

export default function MarketplaceSellModule() {
  // Global state
  const { harvestablePodBalance, plots } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // Local state
  const [section, setSection] = useState<number>(0);
  const [sellOffer, setSellOffer] = useState<SellOfferState | null>(null);
  const createListingModuleRef = useRef<any>();

  // Handlers
  const handleTabChange = (event, newSection) => {
    setSection(newSection);
  };

  // Sections
  const sectionTitles = ['Sell Now', 'Create Listing'];
  const sectionTitlesDescription = [
    marketStrings.sell,
    marketStrings.createListing,
  ];

  // This only supports eth right now
  // TODO: need to handle beans / beans + eth
  const onCreate = async () => {
    const beanstalk = beanstalkContract();
    const { index, pricePerPod, amount, expiresIn } = sellOffer;
    const expiry = (expiresIn.times(10 ** 6).plus(harvestableIndex.times(10 ** 6))).toString();
    // Reset inputs
    setSellOffer(null);
    createListingModuleRef.current.resetForm();
    // Send request
    const res = await beanstalk.listPlot(
      index.times(10 ** 6).toString(),
      pricePerPod.times(10 ** 6).toString(),
      expiry,
      amount.times(10 ** 6).toString(),
    );
    console.log('listPlot', res);
  };
  // Require all inputs have values > 0 or >= 0.
  const readyToSubmit = (
    sellOffer?.index?.gte(0)
    && sellOffer?.amount?.gt(0)
    && sellOffer?.pricePerPod?.gt(0)
    && sellOffer?.expiresIn?.gte(0)
  );

  const sections = [
    <Offers
      mode="ALL"
    />,
    <CreateListingModule
      plots={plots}
      ref={createListingModuleRef}
      hasPlots={
        plots !== undefined &&
        (Object.keys(plots).length > 0 ||
          harvestablePodBalance.isGreaterThan(0))
      }
      index={parseFloat(harvestableIndex)}
      setSellOffer={setSellOffer} // FIXME: naming, should be listing
      readyToSubmit={readyToSubmit}
    />,
  ];

  // Render
  return (
    <>
      <BaseModule
        // Styles
        style={{ marginTop: '20px' }}
        // Handlers
        handleForm={onCreate}
        handleTabChange={handleTabChange}
        // Form setup
        isDisabled={!readyToSubmit}
        showButton={section === 1}
        // Sections
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
