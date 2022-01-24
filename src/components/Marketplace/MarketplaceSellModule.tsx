import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { Listing } from 'state/marketplace/reducer';
import {
  BaseModule,
  marketStrings,
} from 'components/Common';

import Offers from './Offers/Offers';
import CreateListingModule from './Listings/CreateListingModule';

type ListingState = {
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

  /** Toggle sections: 'Sell Now' and 'Create Listing' */
  const [section, setSection] = useState<number>(0);
  /** Stored form state when creating a listing. */
  const [listing, setListing] = useState<ListingState | null>(null);

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
  // FIXME: this is inconsistent with the approach used in other modules.
  // const onCreate = async () => {
  //   if (!listing) return;
  //   const { index, pricePerPod, amount, expiresIn } = listing;
  //   const expiry = (expiresIn.times(10 ** 6).plus(harvestableIndex.times(10 ** 6))).toString();
        
  //   // Toast
  //   const txToast = new TransactionToast({
  //     loading: ``,
  //     success: 'Listing placed!',
  //   });

  //   // Execute
  //   listPlot(
  //     index.times(10 ** 6).toString(),
  //     pricePerPod.times(10 ** 6).toString(),
  //     expiry,
  //     amount.times(10 ** 6).toString(),
  //     (response) => {
  //       // Reset inputs
  //       setListing(null);
  //       createListingModuleRef.current.resetForm();
  //       txToast.confirming(response);
  //     }
  //   )
  //   .then((value) => {
  //     txToast.success(value);
  //   })
  //   .catch((err) => {
  //     txToast.error(err);
  //   });
  // };

  /** Ref to help with form submissions */
  const createListingModuleRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        break;
      case 1:
        createListingModuleRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  // Require all inputs have values > 0 or >= 0.
  const readyToSubmit = (
    listing?.index?.gte(0)
    && listing?.amount?.gt(0)
    && listing?.pricePerPod?.gt(0)
    && listing?.expiresIn?.gte(0)
  );

  const sections = [
    <Offers
      mode="ALL"
    />,
    <CreateListingModule
      ref={createListingModuleRef}
      // isFormDisabled={false}
      // setIsFormDisabled
      harvestableIndex={parseFloat(harvestableIndex)}
      plots={plots}
      hasPlots={
        plots !== undefined &&
        (Object.keys(plots).length > 0 ||
          harvestablePodBalance.isGreaterThan(0))
      }
      setListing={setListing} // FIXME: naming, should be listing
      readyToSubmit={readyToSubmit || false}
    />,
  ];

  return (
    <BaseModule
      // Styles
      style={{ marginTop: '20px' }}
      // Handlers
      handleForm={handleForm}
      handleApprove={undefined}
      resetForm={undefined}
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
  );
}
