import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@material-ui/core';
import { List as ListIcon } from '@material-ui/icons';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { updateBeanstalkBeanlusdAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import { approveBeanstalkBeanlusd, poolForLP } from 'util/index';
import { BaseModule, ListTable, SiloAsset, TransitAsset, siloStrings  } from 'components/Common';
import BeanlusdDepositAction from './Actions/BeanlusdDepositAction';

export default function BeanlusdDeposit() {
  const [section, setSection] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(BASE_SLIPPAGE),
    useBalanced: false,
    useCrv3: false,
  });

  const { beanstalkBeanlusdAllowance } = useSelector<AppState, AppState['allowances']>(
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

  const sectionTitles = ['Deposit'];
  const sectionTitlesDescription = [
    siloStrings.beanlusddeposit,
    siloStrings.beanlusdWithdraw.replace('{0}', totalBalance.withdrawSeasons),
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
      setSettings((p) => ({ ...p, useBalanced: false }));
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

  //
  const depositRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        depositRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const sections = [
    <BeanlusdDepositAction
      key={0}
      ref={depositRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />
  ];

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
        isCurve
        page={page}
        poolForLPRatio={poolForLPRatio}
        season={season}
        bdvCrates={beanlusdBDVDeposits}
      />
    );
    sectionTitlesInfo.push('Bean:LUSD Deposits');
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
        isCurve
        page={page}
        poolForLPRatio={poolForLPRatio}
      />
    );
    sectionTitlesInfo.push('Bean:LUSD Withdrawals');
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
    ? beanstalkBeanlusdAllowance
    : new BigNumber(1);

  return (
    <>
      <BaseModule
        allowance={allowance}
        resetForm={() => {
          setSettings({ ...settings });
        }}
        handleApprove={approveBeanstalkBeanlusd}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled}
        marginTop="20px"
        marginMeta="14px 0 22px 0"
        section={section}
        sectionTitles={(sectionTitles.length > 1) ? sectionTitles : []}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={updateBeanstalkBeanlusdAllowance}
        singleReset
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Deposit'}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
