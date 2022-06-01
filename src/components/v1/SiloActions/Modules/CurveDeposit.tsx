import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { updateBeanstalkCurveAllowance } from 'state/v1/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import { approveBeanstalkCurve, poolForLP } from 'util/index';
import { BaseModule, curveStrings, ListTable, SiloAsset, TransitAsset, siloStrings  } from 'components/Common';
import CurveDepositAction from './Actions/CurveDepositAction';
import { useStyles } from './SiloStyles';

export default function CurveDeposit() {
  const classes = useStyles();
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
    curveBalance,
    curveReceivableBalance,
    curveDeposits,
    curveBDVDeposits,
    curveReceivableCrates,
    curveWithdrawals,
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
    curveStrings.deposit,
    curveStrings.withdraw,
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
      prices.beanCrv3Reserve,
      prices.crv3Reserve,
      totalBalance.totalCrv3
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
    <CurveDepositAction
      key={0}
      ref={depositRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />
  ];

  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (curveDeposits !== undefined && Object.keys(curveDeposits).length > 0) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.LP}
        crates={curveDeposits}
        handleChange={handlePageChange}
        indexTitle="Season"
        isLP
        isCurve
        page={page}
        poolForLPRatio={poolForLPRatio}
        season={season}
        bdvCrates={curveBDVDeposits}
      />
    );
    sectionTitlesInfo.push('Curve Deposits');
  }
  if (
    (curveWithdrawals !== undefined && Object.keys(curveWithdrawals).length > 0) ||
    curveReceivableBalance.isGreaterThan(0)
  ) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.LP}
        crates={curveWithdrawals}
        claimableBalance={curveReceivableBalance}
        claimableCrates={curveReceivableCrates}
        handleChange={handlePageChange}
        index={season}
        indexTitle="Seasons to Arrival"
        isLP
        isCurve
        page={page}
        poolForLPRatio={poolForLPRatio}
      />
    );
    sectionTitlesInfo.push('Curve Withdrawals');
  }

  const showListTablesIcon =
    sectionsInfo.length > 0 ? (
      <Box className={classes.listTablesIcon}>
        <IconButton
          color="primary"
          onClick={() => {
            const shouldExpand = listTablesStyle.display === 'none';
            setListTablesStyle(
              shouldExpand ? { display: 'block' } : { display: 'none' }
            );
          }}
          className={classes.iconButton}
          size="large">
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

  const allowance = section === 0 && curveBalance.isGreaterThan(0)
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
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Deposit'}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
