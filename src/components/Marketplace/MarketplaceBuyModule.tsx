import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateBeanstalkBeanAllowance } from 'state/allowances/actions';
import {
  approveBeanstalkBean,
  SwapMode,
  poolForLP,
} from 'util/index';
import { BaseModule, marketStrings } from 'components/Common';
import { BASE_SLIPPAGE } from 'constants/index';

import { CreateOfferModule } from './Offers/CreateOfferModule';
// import Graph from './GraphModule';
import Listings from './Listings/Listings';

//
export default function MarketplaceBuyModule() {
  // Global state
  const {
    beanPrice,
    beanReserve,
    ethReserve,
    usdcPrice,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const { totalLP } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { beanstalkBeanAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  /** */
  const [section, setSection] = useState(0);
  /** */
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  /** */
  const [settings, setSettings] = useState({
    claim: false,
    mode: SwapMode.Ethereum,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });

  // Sections
  const sectionTitles = ['Buy Now', 'Create Offer'];
  const sectionTitlesDescription = [
    marketStrings.buy,
    marketStrings.createOffer,
  ];

  // Handlers
  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
    }
  };

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = ethReserve
      .plus(sellEth)
      .dividedBy(beanReserve.minus(buyBeans))
      .dividedBy(usdcPrice);
    return beanPrice.plus(endPrice).dividedBy(2);
  };

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      beanReserve,
      ethReserve,
      totalLP
    );
  };

  // NOTE: Can send ref to listings
  // FIXME: buyListingRef isn't used
  const buyListingRef = useRef<any>();
  const buyOfferRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        buyListingRef.current.handleForm();
        break;
      case 1:
        buyOfferRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const sections = [
    <Listings
      mode="ALL"
    />,
    <CreateOfferModule
      ref={buyOfferRef}
      isFormDisabled={isFormDisabled}
      setIsFormDisabled={setIsFormDisabled}
      settings={settings}
      setSettings={setSettings}
      poolForLPRatio={poolForLPRatio}
      updateExpectedPrice={updateExpectedPrice}
    />,
  ];

  const allowance =
    (settings.mode === SwapMode.Bean ||
      settings.mode === SwapMode.BeanEthereum) &&
    section === 1
      ? beanstalkBeanAllowance
      : new BigNumber(1);

  return (
    <>
      <BaseModule
        // Styles
        marginTop="20px"
        // Handlers
        handleApprove={approveBeanstalkBean}
        handleForm={handleForm}
        resetForm={() => {
          setSettings({ ...settings, mode: SwapMode.Ethereum });
        }}
        handleTabChange={handleTabChange}
        // Form setup
        allowance={allowance}
        setAllowance={updateBeanstalkBeanAllowance}
        isDisabled={isFormDisabled}
        showButton={section === 1}
        // Sections
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
      >
        {sections[section]}
      </BaseModule>
      {/* <Graph /> */}
    </>
  );
}
