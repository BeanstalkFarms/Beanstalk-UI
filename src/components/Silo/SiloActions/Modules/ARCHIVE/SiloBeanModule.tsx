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
import { BeanClaimModule } from '../SubModules/BeanClaimModule';
import { BeanDepositModule } from '../SubModules/BeanDepositModule';
import { BeanWithdrawModule } from '../SubModules/BeanWithdrawModule';

export default function SiloBeanModule() {
  const { beanstalkBeanAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const {
    beanBalance,
    ethBalance,
    beanDeposits,
    lockedSeasons,
    beanReceivableBalance,
    beanReceivableCrates,
    farmableBeanBalance,
    rawBeanDeposits,
    beanWithdrawals,
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
  const [settings, setSettings] = useState({
    claim: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });
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

  const sectionTitles = ['Deposit', 'Withdraw'];
  const sectionTitlesDescription = [
    siloStrings.beanDeposit,
    siloStrings.beanWithdraw.replace('{0}', totalBalance.withdrawSeasons),
  ];
  const sectionTitlesInfoDescription = [
    siloStrings.beanDepositsTable,
    siloStrings.beanWithdrawalsTable,
  ];

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
      setSettings({
        claim: false,
        mode: null,
        slippage: new BigNumber(BASE_SLIPPAGE),
      });
    }
  };
  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  if (settings.mode === null) {
    if (beanBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Bean }));
    } else if (ethBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    } else if (beanBalance.isEqualTo(0) && ethBalance.isEqualTo(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    }
  }

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = prices.ethReserve
      .plus(sellEth)
      .dividedBy(prices.beanReserve.minus(buyBeans))
      .dividedBy(prices.usdcPrice);
    return prices.beanPrice.plus(endPrice).dividedBy(2);
  };

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

  /* */
  const sections = [
    <BeanDepositModule
      key={0}
      poolForLPRatio={poolForLPRatio}
      ref={depositRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings}
      settings={settings}
      updateExpectedPrice={updateExpectedPrice}
    />,
    <BeanWithdrawModule
      key={1}
      ref={withdrawRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings}
      settings={settings}
      poolForLPRatio={poolForLPRatio}
    />,
  ];

  /* */
  if (beanReceivableBalance.isGreaterThan(0)) {
    sections.push(
      <BeanClaimModule
        key={2}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
      />
    );
    sectionTitles.push('Claim');
    sectionTitlesDescription.push(siloStrings.beanClaim);
  }
  if (section > sectionTitles.length - 1) setSection(0);

  /* "Info" section == the BaseModule shown below the Deposit &
     Deposit tabs. Used to show bean deposits. */
  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (beanDeposits !== undefined && Object.keys(beanDeposits).length > 0) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.Bean}
        claimableBalance={farmableBeanBalance}
        claimableStalk={farmableBeanBalance}
        crates={rawBeanDeposits}
        handleChange={handlePageChange}
        indexTitle="Season"
        page={page}
        season={season}
      />
    );
    sectionTitlesInfo.push('Bean Deposits');
  }
  if (
    (beanWithdrawals !== undefined &&
      Object.keys(beanWithdrawals).length > 0) ||
    beanReceivableBalance.isGreaterThan(0)
  ) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.Bean}
        crates={beanWithdrawals}
        claimableBalance={beanReceivableBalance}
        claimableCrates={beanReceivableCrates}
        handleChange={handlePageChange}
        index={season}
        indexTitle="Seasons to Arrival"
        page={page}
      />
    );
    sectionTitlesInfo.push('Bean Withdrawals');
  }

  /* */
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

  const allowance =
    (settings.mode === SwapMode.Bean ||
      settings.mode === SwapMode.BeanEthereum) &&
    section === 0
      ? beanstalkBeanAllowance
      : new BigNumber(1);

  /* */
  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        allowance={allowance}
        resetForm={() => {
          setSettings({ ...settings, mode: SwapMode.Ethereum });
        }}
        handleApprove={approveBeanstalkBean}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={
          isFormDisabled && (isFormDisabled)
        }
        lockedSeasons={lockedSeasons}
        mode={settings.mode}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={updateBeanstalkBeanAllowance}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
