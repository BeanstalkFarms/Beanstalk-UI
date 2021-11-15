import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@material-ui/core';
import { AppState } from 'state';
import { List as ListIcon } from '@material-ui/icons';
import {
  updateBeanstalkBeanAllowance,
  updateBeanstalkLPAllowance,
} from 'state/allowances/actions';
import { BASE_SLIPPAGE, LPBEAN_TO_STALK, zeroBN } from '../../constants';
import {
  approveBeanstalkBean,
  approveBeanstalkLP,
  SwapMode,
  poolForLP,
} from '../../util';
import {
  BaseModule,
  ListTable,
  SiloAsset,
  siloStrings,
  TransitAsset,
} from '../Common';
import { LPDepositModule } from './LPDepositModule';
import { LPWithdrawModule } from './LPWithdrawModule';
import { LPClaimModule } from './LPClaimModule';

export default function SiloLPModule() {
  const { beanstalkBeanAllowance, beanstalkLPAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const {
    lpBalance,
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    beanDeposits,
    claimable,
    claimableEthBalance,
    hasClaimable,
    beanSiloBalance,
    beanClaimableBalance,
    lpDeposits,
    locked,
    lpSiloBalance,
    seedBalance,
    stalkBalance,
    lpSeedDeposits,
    lpReceivableCrates,
    lpWithdrawals,
    lockedSeasons,
    harvestablePodBalance,
    beanReceivableBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const prices = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = prices.ethReserve
      .plus(sellEth)
      .dividedBy(prices.beanReserve.minus(buyBeans))
      .dividedBy(prices.usdcPrice);
    return prices.beanPrice.plus(endPrice).dividedBy(2);
  };

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [zeroBN, zeroBN];
    return poolForLP(
      amount,
      prices.beanReserve,
      prices.ethReserve,
      totalBalance.totalLP
    );
  };

  const [section, setSection] = useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);
  const [settings, setSettings] = useState({
    claim: false,
    convert: false,
    useLP: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });
  const [page, setPage] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [listTablesStyle, setListTablesStyle] = useState({ display: 'block' });

  const sectionTitles = ['Deposit', 'Withdraw'];

  const sectionTitlesDescription = [
    siloStrings.lpDeposit,
    siloStrings.lpWithdraw,
  ];
  const sectionTitlesInfoDescription = [
    siloStrings.lpDepositsTable,
    siloStrings.lpWithdrawalsTable,
  ];

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  if (settings.mode === null) {
    if (lpBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.LP }));
    } else if (beanBalance.isGreaterThan(0) && ethBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.BeanEthereum }));
    } else if (beanBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Bean }));
    } else if (ethBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    } else if (beanBalance.isEqualTo(0) && ethBalance.isEqualTo(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    }
  }

  const depositRef = useRef<any>();
  const withdrawRef = useRef<any>();
  const claimRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        depositRef.current.handleForm();
        break;
      case 1:
        withdrawRef.current.handleForm();
        break;
      case 2:
        claimRef.current.handleForm();
        break;
      default:
        break;
    }
  };
  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
    }
  };
  const claimLPBeans = lpReceivableBalance.isGreaterThan(0)
    ? poolForLPRatio(lpReceivableBalance)[0]
    : new BigNumber(0);

  const beanClaimable = beanReceivableBalance
    .plus(harvestablePodBalance)
    .plus(poolForLPRatio(lpReceivableBalance)[0]);

  const ethClaimable = claimableEthBalance
    .plus(poolForLPRatio(lpReceivableBalance)[1]);

  const sections = [
    <LPDepositModule
      key={0}
      beanClaimable={beanClaimable}
      ethClaimable={ethClaimable}
      beanBalance={beanBalance}
      beanCrates={beanDeposits}
      beanReceivableBalance={beanReceivableBalance}
      beanReserve={prices.beanReserve}
      beanToEth={prices.ethReserve.dividedBy(prices.beanReserve)}
      beanToStalk={LPBEAN_TO_STALK}
      claimable={claimable}
      claimableEthBalance={claimableEthBalance}
      ethBalance={ethBalance}
      ethReserve={prices.ethReserve}
      ethToBean={prices.beanReserve.dividedBy(prices.ethReserve)}
      harvestablePodBalance={harvestablePodBalance}
      hasClaimable={hasClaimable}
      lpBalance={lpBalance}
      lpReceivableBalance={lpReceivableBalance}
      updateExpectedPrice={updateExpectedPrice}
      maxFromBeanSiloVal={beanSiloBalance}
      beanClaimableBalance={beanClaimableBalance.plus(claimLPBeans)}
      beanLPClaimableBalance={claimLPBeans}
      ref={depositRef}
      season={season}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      totalLP={totalBalance.totalLP}
      totalStalk={totalBalance.totalStalk}
    />,
    <LPWithdrawModule
      key={1}
      beanClaimable={beanClaimable}
      ethClaimable={ethClaimable}
      beanReceivableBalance={beanReceivableBalance}
      claimable={claimable}
      claimableEthBalance={claimableEthBalance}
      crates={lpDeposits}
      harvestablePodBalance={harvestablePodBalance}
      hasClaimable={hasClaimable}
      lpReceivableBalance={lpReceivableBalance}
      locked={section === 1 && locked}
      maxFromLPVal={lpSiloBalance}
      maxToSeedsVal={seedBalance}
      maxToStalkVal={stalkBalance}
      poolForLPRatio={poolForLPRatio}
      ref={withdrawRef}
      season={season}
      seedCrates={lpSeedDeposits}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      totalLP={totalBalance.totalLP}
      totalStalk={totalBalance.totalStalk}
    />,
  ];
  if (lpReceivableBalance.isGreaterThan(0)) {
    sections.push(
      <LPClaimModule
        key={2}
        // claimableEthBalance={claimableEthBalance}
        crates={lpReceivableCrates}
        maxFromLPVal={lpReceivableBalance}
        poolForLPRatio={poolForLPRatio}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
      />
    );
    sectionTitles.push('Claim');
    sectionTitlesDescription.push(siloStrings.lpClaim);
  }
  if (section > sectionTitles.length - 1) setSection(0);

  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (lpDeposits !== undefined && Object.keys(lpDeposits).length > 0) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.LP}
        crates={lpDeposits}
        handleChange={handlePageChange}
        indexTitle="Season"
        isLP
        page={page}
        poolForLPRatio={poolForLPRatio}
        season={season}
        seedCrates={lpSeedDeposits}
      />
    );
    sectionTitlesInfo.push('LP Deposits');
  }
  if (
    (lpWithdrawals !== undefined && Object.keys(lpWithdrawals).length > 0) ||
    lpReceivableBalance.isGreaterThan(0)
  ) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.LP}
        crates={lpWithdrawals}
        claimableBalance={lpReceivableBalance}
        claimableCrates={lpReceivableCrates}
        handleChange={handlePageChange}
        index={season}
        indexTitle="Seasons to Arrival"
        isLP
        page={page}
        poolForLPRatio={poolForLPRatio}
      />
    );
    sectionTitlesInfo.push('LP Withdrawals');
  }

  const showListTablesIcon =
    sectionsInfo.length > 0 ? (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          margin: '20px 0 -56px -4px',
        }}
      >
        <IconButton
          color="primary"
          onClick={() => {
            const shouldExpand = listTablesStyle.display === 'none';
            setListTablesStyle(
              shouldExpand ? { display: 'block' } : { display: 'none' }
            );
          }}
          style={{ height: '44px', width: '44px', marginTop: '-8px' }}
        >
          <ListIcon />
        </IconButton>
      </Box>
    ) : null;

  const showListTables =
    sectionsInfo.length > 0 ? (
      <Box style={{ ...listTablesStyle, marginTop: '61px' }}>
        <BaseModule
          handleTabChange={handleTabInfoChange}
          section={sectionInfo}
          sectionTitles={sectionTitlesInfo}
          sectionTitlesDescription={sectionTitlesInfoDescription}
          showButton={false}
        >
          {sectionsInfo[sectionInfo]}
        </BaseModule>
      </Box>
    ) : null;

  let allowance = new BigNumber(1);
  let setAllowance = updateBeanstalkBeanAllowance;
  let handleApprove = approveBeanstalkBean;
  if (
    settings.mode === SwapMode.Bean ||
    settings.mode === SwapMode.BeanEthereum
  ) {
    allowance = beanstalkBeanAllowance;
    if (allowance.isGreaterThan(0) && settings.useLP) {
      allowance = beanstalkLPAllowance;
      setAllowance = updateBeanstalkLPAllowance;
      handleApprove = approveBeanstalkLP;
    }
  } else if (settings.mode === SwapMode.LP) {
    allowance = beanstalkLPAllowance;
    setAllowance = updateBeanstalkLPAllowance;
    handleApprove = approveBeanstalkLP;
  }

  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        allowance={section === 0 ? allowance : new BigNumber(1)}
        resetForm={() => {
          setSettings({ ...settings, mode: SwapMode.Ethereum });
        }}
        handleApprove={handleApprove}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled}
        locked={section === 1 && locked}
        lockedSeasons={lockedSeasons}
        mode={settings.mode}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={setAllowance}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
