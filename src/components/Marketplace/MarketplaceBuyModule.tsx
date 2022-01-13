import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  approveBeanstalkBean,
  beanstalkContract,
  SwapMode,
  poolForLP,
} from 'util/index';
import { BaseModule, siloStrings } from 'components/Common';
import { BASE_SLIPPAGE } from 'constants/index';
import { CreateBuyOfferModule } from './CreateBuyOfferModule';
import Listings from './Listings';

export default function MarketplaceBuyModule() {
  const [buyOffer, setBuyOffer] = useState(null);
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

  const sectionTitles = [
    'Pod Listings',
    'Make Offer',
  ];
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

  // TODO: need to handle beans / beans + eth
  const onCreate = async () => {
    const beanstalk = beanstalkContract();
    const {
      pricePerPod,
      buyBeanAmount,
      fromBeanValue,
      fromEthValue,
      maxPlaceInLine,
    } = buyOffer;
    console.log('buy bean amount:', buyBeanAmount.toString());
    console.log('from eth value:', fromEthValue.toString());
    console.log('from bean value:', fromBeanValue.toString());
    // This assumes eth right now
    const res = await beanstalk.buyBeansAndListBuyOffer(
      maxPlaceInLine.toString(),
      pricePerPod.times(10 ** 6).toString(),
      0,
      buyBeanAmount.times(10 ** 6).toString(),
      {
        value: fromEthValue.times(10 ** 18).toFixed(),
      });
    console.log('res:', res);
  };

  const sections = [
    <Listings />,
    <CreateBuyOfferModule
      poolForLPRatio={poolForLPRatio}
      setBuyOffer={setBuyOffer}
      updateExpectedPrice={updateExpectedPrice}
      settings={settings}
      setSettings={setSettings}
      isFormDisabled={isFormDisabled}
      setIsFormDisabled={setIsFormDisabled}
    />,
  ];

  return (
    <>
      <BaseModule
        marginTop="20px"
        handleApprove={approveBeanstalkBean}
        handleForm={onCreate}
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
