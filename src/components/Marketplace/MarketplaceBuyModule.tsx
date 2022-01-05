import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { approveBeanstalkBean, beanstalkContract } from 'util/index';
import {
  BaseModule,
  siloStrings,
} from 'components/Common';
import { CreateBuyOfferModule } from './CreateBuyOfferModule';
import Listings from './Listings';

export default function MarketplaceBuyModule() {
  const [buyOffer, setBuyOffer] = useState(null);

  const {
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    claimable,
    claimableEthBalance,
    hasClaimable,
    harvestablePodBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const prices = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const [section, setSection] = useState(0);

  const sectionTitles = [
    'Pod Listings',
    'Make Offer',
  ];
  const sectionTitlesDescription = [
    siloStrings.beanDeposit,
    siloStrings.beanDeposit,
  ];

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = prices.ethReserve
      .plus(sellEth)
      .dividedBy(prices.beanReserve.minus(buyBeans))
      .dividedBy(prices.usdcPrice);
    return prices.beanPrice.plus(endPrice).dividedBy(2);
  };

  // TODO: need to handle beans / beans + eth
  const onCreate = async () => {
    const beanstalk = beanstalkContract();
    const {
      maxPlaceInLine,
      pricePerPod,
      buyBeanAmount,
      fromBeanValue,
      fromEthValue,
    } = buyOffer;
    console.log(prices);
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
      key={0}
      beanBalance={beanBalance}
      beanReserve={prices.beanReserve}
      claimable={claimable}
      claimableEthBalance={claimableEthBalance}
      ethBalance={ethBalance}
      ethReserve={prices.ethReserve}
      hasClaimable={hasClaimable}
      harvestablePodBalance={harvestablePodBalance}
      lpReceivableBalance={lpReceivableBalance}
      setBuyOffer={setBuyOffer}
      setSection={setSection}
      updateExpectedPrice={updateExpectedPrice}
    />,
  ];

  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        handleApprove={approveBeanstalkBean}
        handleForm={onCreate}
        isDisabled={buyOffer == null}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        handleTabChange={(e, value) => {
          setSection(value);
        }}
        showButton={section === 1}
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
