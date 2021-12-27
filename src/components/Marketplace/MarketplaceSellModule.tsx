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
import { BASE_SLIPPAGE } from 'constants/index';
import {
  approveBeanstalkBean,
  approveBeanstalkLP,
  SwapMode,
  // poolForLP,
  FarmAsset,
  CryptoAsset,
} from 'util/index';
import {
  BaseModule,
  ListTable,
  // SiloAsset,
  siloStrings,
  // TransitAsset,
} from 'components/Common';
// import { LPDepositModule } from '../Silo/LPDepositModule';
import { PlotSellModule } from './PlotSellModule';
// import { LPWithdrawModule } from '../Silo/LPWithdrawModule';
// import { LPClaimModule } from '../Silo/LPClaimModule';

export default function MarketplaceSellModule() {
  // Global state
  const {
    lpBalance,
    beanBalance,
    ethBalance,
    // lpReceivableBalance,
    // beanDeposits,
    // claimable,
    // claimableEthBalance,
    // hasClaimable,
    // beanSiloBalance,
    // beanClaimableBalance,
    // lpDeposits,
    locked,
    // lpSiloBalance,
    // seedBalance,
    // stalkBalance,
    // lpSeedDeposits,
    // lpReceivableCrates,
    // lpWithdrawals,
    lockedSeasons,
    harvestablePodBalance,
    // beanReceivableBalance,
    plots,
    harvestablePlots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { beanstalkBeanAllowance, beanstalkLPAllowance } = useSelector<AppState, AppState['allowances']>(
    (state) => state.allowances
  );
  // const prices = useSelector<AppState, AppState['prices']>(
  //   (state) => state.prices
  // );
  // const season = useSelector<AppState, AppState['season']>(
  //   (state) => state.season.season
  // );
  // const totalBalance = useSelector<AppState, AppState['totalBalance']>(
  //   (state) => state.totalBalance
  // );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // Local state
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

  // Handlers
  // const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
  //   const endPrice = prices.ethReserve
  //     .plus(sellEth)
  //     .dividedBy(prices.beanReserve.minus(buyBeans))
  //     .dividedBy(prices.usdcPrice);
  //   return prices.beanPrice.plus(endPrice).dividedBy(2);
  // };
  // const poolForLPRatio = (amount: BigNumber) => {
  //   if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
  //   return poolForLP(
  //     amount,
  //     prices.beanReserve,
  //     prices.ethReserve,
  //     totalBalance.totalLP
  //   );
  // };
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

  // Setup
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

  // const claimLPBeans = lpReceivableBalance.isGreaterThan(0)
  //   ? poolForLPRatio(lpReceivableBalance)[0]
  //   : new BigNumber(0);
  // const beanClaimable = beanReceivableBalance
  //   .plus(harvestablePodBalance)
  //   .plus(poolForLPRatio(lpReceivableBalance)[0]);
  // const ethClaimable = claimableEthBalance.plus(
  //   poolForLPRatio(lpReceivableBalance)[1]
  // );

  // Primary section:
  // Sell a Plot
  const sectionTitles = ['Sell Plot'];
  const sectionTitlesDescription = [
    siloStrings.lpDeposit, // FIXME
  ];

  const sendRef = useRef<any>();
  const [toAddress, setToAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const sections = [
    <PlotSellModule
      key={0}
      plots={plots}
      hasPlots={
        plots !== undefined &&
        (Object.keys(plots).length > 0 ||
          harvestablePodBalance.isGreaterThan(0))
      }
      index={parseFloat(harvestableIndex)}
      fromAddress=""
      fromToken={CryptoAsset.Bean}
      ref={sendRef}
      // Shared state
      isFormDisabled={isFormDisabled}
      setIsFormDisabled={setIsFormDisabled}
      isValidAddress={isValidAddress}
      setIsValidAddress={setIsValidAddress}
      toAddress={toAddress}
      setToAddress={setToAddress}
      setSection={setSection}
    />,
  ];

  // Bottom section:
  // List of plots
  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (plots !== undefined && (Object.keys(plots).length > 0 || harvestablePodBalance.isGreaterThan(0))) {
    sectionsInfo.push(
      <ListTable
        asset={FarmAsset.Pods}
        claimableBalance={harvestablePodBalance}
        claimableCrates={harvestablePlots}
        crates={plots}
        description="Sown Plots will show up here."
        handleChange={handlePageChange}
        indexTitle="Place in Line"
        index={parseFloat(harvestableIndex)}
        page={page}
        title="Plots"
      />
    );
    sectionTitlesInfo.push('Plots');
  }
  const showListTablesIcon = sectionsInfo.length > 0 ? (
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
  const showListTables = sectionsInfo.length > 0 ? (
    <Box style={{ ...listTablesStyle, marginTop: '61px' }}>
      <BaseModule
        handleTabChange={handleTabInfoChange}
        section={sectionInfo}
        sectionTitles={sectionTitlesInfo}
        sectionTitlesDescription={[
          // eslint-disable-next-line
          'A Plot of Pods is created everytime Beans are Sown. Plots have a place in the Pod Line based on the order they were created. As Pods are harvested, your Plots will automatically advance in line. Entire Plots and sections of Plots can be transferred using the Send tab of the Field module.',
        ]}
        showButton={false}
      >
        {sectionsInfo[sectionInfo]}
      </BaseModule>
    </Box>
  ) : null;

  // Tweaks
  let allowance = new BigNumber(1);
  let setAllowance = updateBeanstalkBeanAllowance;
  let handleApprove = approveBeanstalkBean;
  if (settings.mode === SwapMode.Bean || settings.mode === SwapMode.BeanEthereum) {
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

  // Render
  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        allowance={section === 0 ? allowance : new BigNumber(1)}
        resetForm={() => {
          setSettings({
            ...settings,
            mode: SwapMode.Ethereum,
          });
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
