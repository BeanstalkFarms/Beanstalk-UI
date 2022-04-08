import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@material-ui/core';
import ListIcon from '@material-ui/icons/List';
import { AppState } from 'state';
import { updateBeanstalkBeanAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import { approveBeanstalkBean, SwapMode, poolForLP } from 'util/index';
import {
  BaseModule,
  CryptoAsset,
  FarmAsset,
  ListTable,
  fieldStrings,
} from 'components/Common';
import { makeStyles } from '@material-ui/styles';
import { SowModule } from './SowModule';
import { HarvestModule } from './HarvestModule';
import { SendPlotModule } from './SendPlotModule';

const useStyles = makeStyles({
  listTableBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    margin: '20px 0 -56px -4px',
  },
  iconButton: {
    height: '44px',
    width: '44px',
    marginTop: '-8px'
  }
});

export default function FieldModule() {
  const classes = useStyles();
  const newBN = new BigNumber(-1);

  /* App state */
  const { beanstalkBeanAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const {
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    beanClaimableBalance,
    claimable,
    claimableEthBalance,
    harvestablePodBalance,
    hasClaimable,
    plots,
    harvestablePlots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const prices = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { weather, soil, harvestableIndex } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);

  /* Local state */
  const [section, setSection] = useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);
  const [page, setPage] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [listTablesStyle, setListTablesStyle] = useState({ display: 'block' });

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = prices.ethReserve
      .plus(sellEth)
      .dividedBy(prices.beanReserve.minus(buyBeans))
      .dividedBy(prices.usdcPrice);
    return prices.beanPrice.plus(endPrice).dividedBy(2);
  };

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [newBN, newBN];
    return poolForLP(
      amount,
      prices.beanReserve,
      prices.ethReserve,
      totalBalance.totalLP
    );
  };

  const [settings, setSettings] = useState({
    claim: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });

  const [toAddress, setToAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  const sectionTitles = ['Sow', 'Send'];
  const sectionTitlesDescription = [fieldStrings.sow, fieldStrings.sendPlot];

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
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

  const sowRef = useRef<any>();
  const sendRef = useRef<any>();
  const harvestRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        sowRef.current.handleForm();
        break;
      case 1:
        sendRef.current.handleForm();
        break;
      case 2:
        harvestRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const claimLPBeans = lpReceivableBalance.isGreaterThan(0)
    ? poolForLPRatio(lpReceivableBalance)[0]
    : new BigNumber(0);

  const ethClaimable = claimableEthBalance.plus(
    poolForLPRatio(lpReceivableBalance)[1]
  );

  const sections = [
    <SowModule
      key={0}
      unripenedPods={totalBalance.totalPods}
      beanBalance={beanBalance}
      beanClaimableBalance={beanClaimableBalance.plus(claimLPBeans)}
      ethClaimable={ethClaimable}
      beanLPClaimableBalance={claimLPBeans}
      beanReserve={prices.beanReserve}
      claimable={claimable}
      claimableEthBalance={claimableEthBalance}
      ethBalance={ethBalance}
      ethReserve={prices.ethReserve}
      hasClaimable={hasClaimable}
      harvestablePodBalance={harvestablePodBalance}
      lpReceivableBalance={lpReceivableBalance}
      ref={sowRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings}
      settings={settings}
      soil={soil}
      updateExpectedPrice={updateExpectedPrice}
      weather={weather}
    />,
    <SendPlotModule
      key={1}
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
      isFormDisabled={isFormDisabled}
      setIsFormDisabled={setIsFormDisabled}
      isValidAddress={isValidAddress}
      setIsValidAddress={setIsValidAddress}
      setToAddress={setToAddress}
      setSection={setSection}
      toAddress={toAddress}
    />,
  ];
  if (harvestablePodBalance.isGreaterThan(0)) {
    sections.push(
      <HarvestModule
        key={2}
        harvestablePlots={harvestablePlots}
        harvestablePodBalance={harvestablePodBalance}
        ref={harvestRef}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
      />
    );
    sectionTitles.push('Harvest');
    sectionTitlesDescription.push(fieldStrings.harvest);
  }
  if (section > sectionTitles.length - 1) setSection(0);

  //
  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (
    plots !== undefined &&
    (Object.keys(plots).length > 0 || harvestablePodBalance.isGreaterThan(0))
  ) {
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

  const showListTablesIcon =
    sectionsInfo.length > 0 ? (
      <Box
        className={classes.listTableBox}
      >
        <IconButton
          color="primary"
          onClick={() => {
            const shouldExpand = listTablesStyle.display === 'none';
            setListTablesStyle(
              shouldExpand ? { display: 'block' } : { display: 'none' }
            );
          }}
          className={classes.iconButton}
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
          sectionTitlesDescription={[fieldStrings.plotTable]}
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

  return (
    <>
      <BaseModule
        allowance={allowance}
        resetForm={() => {
          setSettings({ ...settings, mode: SwapMode.Ethereum });
        }}
        handleApprove={approveBeanstalkBean}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled && sectionTitles[section] !== 'Harvest'}
        marginTop="14px"
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
