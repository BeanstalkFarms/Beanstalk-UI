import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

import {
  approveBeanstalkBean,
  SwapMode,
  poolForLP,
} from 'util/index';
import { BaseModule, siloStrings } from 'components/Common';
import { BASE_SLIPPAGE } from 'constants/index';

import { CreateBuyOfferModule } from './CreateBuyOfferModule';
import Graph from './GraphModule';
import Listings from './Listings';


//
export default function MarketplaceBuyModule() {
  const [section, setSection] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [settings, setSettings] = useState({
    claim: false,
    mode: SwapMode.Ethereum,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });

  const { beanPrice, beanReserve, ethReserve, usdcPrice } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { totalLP } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  // Section setup
  const sectionTitles = ['Buy Now', 'Create Bid'];
  const sectionTitlesDescription = [
    siloStrings.beanDeposit, // TODO
    siloStrings.beanDeposit, // TODO
  ];

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

  // Note: Can send ref to listings
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
    <Listings mode="ALL" />,
    <CreateBuyOfferModule
      ref={buyOfferRef}
      isFormDisabled={isFormDisabled}
      setIsFormDisabled={setIsFormDisabled}
      settings={settings}
      setSettings={setSettings}
      poolForLPRatio={poolForLPRatio}
      updateExpectedPrice={updateExpectedPrice}
    />,
  ];

  return (
    <>
      <Graph />
      <BaseModule
        marginTop="20px"
        handleApprove={approveBeanstalkBean}
        handleForm={handleForm}
        isDisabled={isFormDisabled}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        showButton={section === 1}
        handleTabChange={handleTabChange}
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
