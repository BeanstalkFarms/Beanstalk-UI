import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
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
import BeanClaimAction from './Actions/BeanClaimAction';
import BeanWithdrawAction from './Actions/BeanWithdrawAction';
import { useStyles } from './SiloStyles';

export default function BeanWithdraw() {
  const classes = useStyles();
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

  // 
  const sectionTitles = ['Withdraw', 'Claim'];
  const sectionTitlesDescription = [
    siloStrings.beanWithdraw.replace('{0}', totalBalance.withdrawSeasons),
    siloStrings.beanClaim,
  ];

  // Effect: if section is out of bounds, reset.
  if (section > sectionTitles.length - 1) setSection(0);

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

  // const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
  //   const endPrice = prices.ethReserve
  //     .plus(sellEth)
  //     .dividedBy(prices.beanReserve.minus(buyBeans))
  //     .dividedBy(prices.usdcPrice);
  //   return prices.beanPrice.plus(endPrice).dividedBy(2);
  // };

  // Two options are Withdraw and Claim.
  // Claim only shows if beanReceivableBalance > 0.
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

  /* Main sections */
  const sections = [
    <BeanWithdrawAction
      key={1}
      ref={withdrawRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings}
      settings={settings}
      poolForLPRatio={poolForLPRatio}
    />,
    <BeanClaimAction
      key={1}
      ref={claimRef}
      setIsFormDisabled={setIsFormDisabled}
    />
  ];

  /* "Info" section == the BaseModule shown below the Deposit &
     Deposit tabs. Used to show bean deposits. */
  const sectionsInfo = [];
  const sectionTitlesInfo = [];
  const sectionTitlesInfoDescription = [ // this would be better as sectionTitleDescriptionsInfo or similar
    siloStrings.beanDepositsTable,
    siloStrings.beanWithdrawalsTable,
  ];
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
  if ((beanWithdrawals !== undefined && Object.keys(beanWithdrawals).length > 0)
    || beanReceivableBalance.isGreaterThan(0)) {
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

  /* Icon to toggle display of the info section. */
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

  // Show this section only if there are Deposits / Withdrawals.
  const showListTables = (sectionsInfo.length > 0) ? (
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

  //
  const allowance =
    (settings.mode === SwapMode.Bean ||
      settings.mode === SwapMode.BeanEthereum) &&
    section === 0
      ? beanstalkBeanAllowance
      : new BigNumber(1);

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
        sectionTitles={(sectionTitles.length > 1) ? sectionTitles : []}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={updateBeanstalkBeanAllowance}
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Withdraw'}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
