import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@mui/material';
import { AppState } from 'state';
import { List as ListIcon } from '@mui/icons-material';
import {
  updateBeanstalkBeanAllowance,
  updateBeanstalkLPAllowance,
} from 'state/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import {
  approveBeanstalkBean,
  approveBeanstalkLP,
  SwapMode,
  poolForLP,
} from 'util/index';
import {
  BaseModule,
  ListTable,
  SiloAsset,
  siloStrings,
  TransitAsset,
} from 'components/Common';
import LPWithdrawAction from './Actions/LPWithdrawAction';
import LPClaimAction from './Actions/LPClaimAction';
import { useStyles } from './SiloStyles';

export default function LPWithdraw() {
  const classes = useStyles();
  const { beanstalkBeanAllowance, beanstalkLPAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const {
    lpBalance,
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    lpDeposits,
    lpSeedDeposits,
    lpReceivableCrates,
    lpWithdrawals,
    lockedSeasons,
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

  // const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
  //   const endPrice = prices.ethReserve
  //     .plus(sellEth)
  //     .dividedBy(prices.beanReserve.minus(buyBeans))
  //     .dividedBy(prices.usdcPrice);
  //   return prices.beanPrice.plus(endPrice).dividedBy(2);
  // };

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
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

  const sectionTitles = ['Withdraw', 'Claim'];
  const sectionTitlesDescription = [
    siloStrings.lpDeposit,
    siloStrings.lpWithdraw.replace('{0}', totalBalance.withdrawSeasons),
    siloStrings.lpClaim,
  ];
  const sectionTitlesInfoDescription = [
    siloStrings.lpDepositsTable,
    siloStrings.lpWithdrawalsTable,
  ];

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
      setSettings({
        claim: false,
        convert: false,
        useLP: false,
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
        console.error(`No form matched section ${section}.`);
        break;
    }
  };

  const sections = [
    <LPWithdrawAction
      key={0}
      poolForLPRatio={poolForLPRatio}
      ref={withdrawRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings}
      settings={settings}
    />,
    <LPClaimAction
      key={1}
      ref={claimRef}
      poolForLPRatio={poolForLPRatio}
      setIsFormDisabled={setIsFormDisabled}
    />
  ];

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
        lockedSeasons={lockedSeasons}
        mode={settings.mode}
        section={section}
        sectionTitles={(sectionTitles.length > 1) ? sectionTitles : []}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={setAllowance}
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Withdraw'}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
