import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@material-ui/core';
import { List as ListIcon } from '@material-ui/icons';
import { AppState } from 'state';
import { updateBeanstalkBeanAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import { approveBeanstalkBean, SwapMode, poolForLP } from 'util/index';
import {
  BaseModule,
  ListTable,
  SiloAsset,
  siloStrings,
  TransitAsset,
} from 'components/Common';
import { CreateBuyOfferModule } from './CreateBuyOfferModule';

export default function MarketplaceBuyModule() {
  const [buyOffer, setBuyOffer] = useState(null);
  const { beanstalkBeanAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const {
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    beanDeposits,
    claimable,
    claimableEthBalance,
    hasClaimable,
    beanClaimableBalance,
    locked,
    lockedSeasons,
    beanReceivableBalance,
    beanReceivableCrates,
    farmableBeanBalance,
    rawBeanDeposits,
    beanWithdrawals,
    harvestablePodBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );

  const prices = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const [section, setSection] = useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);
  const [page, setPage] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [listTablesStyle, setListTablesStyle] = useState({ display: 'block' });

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      prices.beanReserve,
      prices.ethReserve,
      totalBalance.totalLP
    );
  };

  const sectionTitles = [
    'Create Buy Offer',
  ];
  const sectionTitlesDescription = [
    siloStrings.beanDeposit,
  ];
  const sectionTitlesInfoDescription = [
    siloStrings.beanDepositsTable,
  ];

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = prices.ethReserve
      .plus(sellEth)
      .dividedBy(prices.beanReserve.minus(buyBeans))
      .dividedBy(prices.usdcPrice);
    return prices.beanPrice.plus(endPrice).dividedBy(2);
  };

  const onCreate = () => {
    console.log('submit buy offer here:', buyOffer);
  };

  const claimLPBeans = lpReceivableBalance.isGreaterThan(0)
    ? poolForLPRatio(lpReceivableBalance)[0]
    : new BigNumber(0);

  const beanClaimable = beanReceivableBalance
    .plus(harvestablePodBalance)
    .plus(poolForLPRatio(lpReceivableBalance)[0]);

  const ethClaimable = claimableEthBalance.plus(
    poolForLPRatio(lpReceivableBalance)[1]
  );

  const sections = [
    <CreateBuyOfferModule
      key={0}
      beanBalance={beanBalance}
      beanClaimableBalance={beanClaimableBalance.plus(claimLPBeans)}
      beanReserve={prices.beanReserve}
      beanClaimable={beanClaimable}
      ethClaimable={ethClaimable}
      beanLPClaimableBalance={claimLPBeans}
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
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
