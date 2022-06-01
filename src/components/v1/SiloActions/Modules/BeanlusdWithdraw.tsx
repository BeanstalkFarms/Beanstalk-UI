import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { updateBeanstalkCurveAllowance } from 'state/v1/allowances/actions';
import { BASE_SLIPPAGE, LUSD_BDV_TO_SEEDS } from 'constants/index';
import { approveBeanstalkCurve, poolForLP } from 'util/index';
import { BaseModule, beanlusdStrings, ListTable, SiloAsset, TransitAsset, siloStrings  } from 'components/Common';
import BeanlusdWithdrawAction from './Actions/BeanlusdWithdrawAction';
import BeanlusdClaimAction from './Actions/BeanlusdClaimAction';

export default function BeanlusdWithdraw() {
  const [section, setSection] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(BASE_SLIPPAGE),
    useBalanced: false,
    useCrv3: false,
  });

  const { beanstalkCurveAllowance } = useSelector<AppState, AppState['allowances']>(
    (state) => state.allowances
  );
  const {
    beanlusdBalance,
    beanlusdReceivableBalance,
    beanlusdDeposits,
    beanlusdBDVDeposits,
    beanlusdReceivableCrates,
    beanlusdWithdrawals,
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

  const sectionTitles = ['Withdraw', 'Claim'];
  const sectionTitlesDescription = [
    siloStrings.beanlusddeposit,
    siloStrings.beanlusdWithdraw.replace('{0}', totalBalance.withdrawSeasons),
    beanlusdStrings.lpClaim,
  ];
  const sectionTitlesInfoDescription = [
    siloStrings.lpDepositsTable,
    siloStrings.lpWithdrawalsTable,
  ];

  const [sectionInfo, setSectionInfo] = useState(0);
  const [page, setPage] = useState(0);
  const [listTablesStyle, setListTablesStyle] = useState({ display: 'block' });

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
      if (newSection > 0) {
        setSettings((p) => ({ ...p, useBalanced: false }));
      } else {
        setSettings((p) => ({ ...p, useBalanced: false }));
      }
    }
  };
  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      prices.beanlusdReserve,
      prices.lusdReserve,
      totalBalance.totalBeanlusd
    );
  };

  const withdrawRef = useRef<any>();
  const claimRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        withdrawRef.current.handleForm();
        break;
      case 1:
        claimRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const sections = [
    <BeanlusdWithdrawAction
      key={1}
      ref={withdrawRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />,
    <BeanlusdClaimAction
      key={2}
      ref={claimRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />
  ];

  if (section > sectionTitles.length - 1) setSection(0);

  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (beanlusdDeposits !== undefined && Object.keys(beanlusdDeposits).length > 0) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.LP}
        crates={beanlusdDeposits}
        handleChange={handlePageChange}
        indexTitle="Season"
        isLP
        isLUSD
        page={page}
        poolForLPRatio={poolForLPRatio}
        season={season}
        bdvCrates={beanlusdBDVDeposits}
        bdvPerSeed={LUSD_BDV_TO_SEEDS}
      />
    );
    sectionTitlesInfo.push('BEAN:LUSD Deposits');
  }
  if (
    (beanlusdWithdrawals !== undefined && Object.keys(beanlusdWithdrawals).length > 0) ||
    beanlusdReceivableBalance.isGreaterThan(0)
  ) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.LP}
        crates={beanlusdWithdrawals}
        claimableBalance={beanlusdReceivableBalance}
        claimableCrates={beanlusdReceivableCrates}
        handleChange={handlePageChange}
        index={season}
        indexTitle="Seasons to Arrival"
        isLP
        isLUSD
        page={page}
        poolForLPRatio={poolForLPRatio}
        bdvPerSeed={LUSD_BDV_TO_SEEDS}
      />
    );
    sectionTitlesInfo.push('BEAN:LUSD Withdrawals');
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

  const allowance = section === 0 && beanlusdBalance.isGreaterThan(0)
    ? beanstalkCurveAllowance
    : new BigNumber(1);

  return (
    <>
      <BaseModule
        allowance={allowance}
        resetForm={() => {
          setSettings({ ...settings });
        }}
        handleApprove={approveBeanstalkCurve}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled}
        marginTop="20px"
        marginMeta="14px 0 22px 0"
        section={section}
        sectionTitles={(sectionTitles.length > 1) ? sectionTitles : []}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={updateBeanstalkCurveAllowance}
        singleReset
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Withdraw'}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
