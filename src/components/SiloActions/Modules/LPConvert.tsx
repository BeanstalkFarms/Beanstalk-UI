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
import { CONVERT_BEAN_SLIPPAGE, CONVERT_LP_SLIPPAGE } from 'constants/index';
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
} from 'components/Common';
import LPConvertAction from './Actions/LPConvertAction';

export default function LPConvert() {
  const { beanstalkBeanAllowance, beanstalkLPAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const {
    lpDeposits,
    lpSeedDeposits,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const {
    beanReserve,
    ethReserve,
    beanPrice,
    usdcPrice,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      beanReserve,
      ethReserve,
      totalBalance.totalLP
    );
  };

  const [section, setSection] = useState(+beanPrice.isGreaterThanOrEqualTo(1));
  const [sectionInfo, setSectionInfo] = useState(0);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(CONVERT_LP_SLIPPAGE),
  });
  const [page, setPage] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [listTablesStyle, setListTablesStyle] = useState({ display: 'block' });

  const sectionTitles = ['Convert LP'];

  const sectionTitlesDescription = [
    siloStrings.convertLPDeposit,
    siloStrings.convertBeanDeposit,
  ];
  const sectionTitlesInfoDescription = [
    siloStrings.lpDepositsTable,
    siloStrings.beanDepositsTable,
  ];

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
      if (newSection === 1) {
        setSettings({
          slippage: new BigNumber(CONVERT_BEAN_SLIPPAGE),
        });
      } else {
        setSettings({
          slippage: new BigNumber(CONVERT_LP_SLIPPAGE),
        });
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

  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = ethReserve
      .plus(sellEth)
      .dividedBy(beanReserve.minus(buyBeans))
      .dividedBy(usdcPrice);
    return beanPrice.plus(endPrice).dividedBy(2);
  };

  const lpRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        lpRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const sections = [
    <LPConvertAction
      key={0}
      ref={lpRef}
      setIsFormDisabled={setIsFormDisabled}
      poolForLPRatio={poolForLPRatio}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      updateExpectedPrice={updateExpectedPrice}
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
          setSettings({ ...settings });
        }}
        handleApprove={handleApprove}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled}
        section={section}
        sectionTitles={(sectionTitles.length > 1) ? sectionTitles : []}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={setAllowance}
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Convert LP'}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
