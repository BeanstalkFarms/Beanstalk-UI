import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@material-ui/core';
import { List as ListIcon } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateBeanstalkCurveAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import { approveBeanstalkCurve, poolForLP } from 'util/index';
import { BaseModule, curveStrings, ListTable, SiloAsset, TransitAsset, siloStrings  } from 'components/Common';
import { DepositModule } from './DepositModule';
import { WithdrawModule } from './WithdrawModule';
import { ClaimModule } from './ClaimModule';

export default function CurveModule() {
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
    beanBalance,
    ethBalance,
    curveReceivableBalance,
    curveDeposits,
    curveBdvDeposits,
    curveReceivableCrates,
    curveWithdrawals,
    lockedSeasons,
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

  const sectionTitles = ['Deposit', 'Withdraw'];
  const sectionTitlesDescription = [curveStrings.deposit, curveStrings.withdraw];
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
      prices.beanReserve,
      prices.ethReserve,
      totalBalance.totalLP
    );
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

  const sections = [
    <DepositModule
      key={0}
      ref={depositRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />,
    <WithdrawModule
      key={1}
      ref={withdrawRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />,
  ];
  const curveLPClaimable = new BigNumber(1); /* placeholder for claimable curve lp */
  if (curveLPClaimable.isGreaterThan(0)) {
    sections.push(
      <ClaimModule
        key={2}
        claimableCurveLPBalance={curveLPClaimable}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
        setSettings={setSettings} // hide
        settings={settings} // hide
      />
    );
    sectionTitles.push('Claim');
    sectionTitlesDescription.push(curveStrings.lpClaim);
  }
  if (section > sectionTitles.length - 1) setSection(0);

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
        page={page}
        poolForLPRatio={poolForLPRatio}
        season={season}
        seedCrates={curveBdvDeposits}
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
        page={page}
        poolForLPRatio={poolForLPRatio}
      />
    );
    sectionTitlesInfo.push('Curve Withdrawals');
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

  return (
    <>
      <BaseModule
        allowance={section === 0 ? beanstalkCurveAllowance : new BigNumber(1)}
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
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={updateBeanstalkCurveAllowance}
        singleReset
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
