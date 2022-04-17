import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';

import { AppState } from 'state';
import {
  CONVERT_BEAN_SLIPPAGE,
  CONVERT_LP_SLIPPAGE
} from 'constants/index';
import {
  BaseModule,
  ListTable,
  SiloAsset,
  siloStrings,
} from 'components/Common';
import BeanConvertAction from './Actions/BeanConvertAction';
import { useStyles } from './SiloStyles';

export default function BeanConvert() {
  const classes = useStyles();

  const {
    beanDeposits,
    farmableBeanBalance,
    rawBeanDeposits,
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

  const [section, setSection] = useState(+beanPrice.isGreaterThanOrEqualTo(1));
  const [sectionInfo, setSectionInfo] = useState(0);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(CONVERT_LP_SLIPPAGE),
  });
  const [page, setPage] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [listTablesStyle, setListTablesStyle] = useState({ display: 'block' });

  const sectionTitles = ['Convert Beans'];

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

  //
  const beanRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        beanRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  //
  const sections = [
    <BeanConvertAction
      key={1}
      ref={beanRef}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      updateExpectedPrice={updateExpectedPrice}
    />
  ];
  if (section > sectionTitles.length - 1) setSection(0);

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

  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        // Allowance
        allowance={new BigNumber(1)}
        // Form
        resetForm={() => {
          setSettings({ ...settings });
        }}
        handleForm={handleForm}
        isDisabled={isFormDisabled}
        setButtonLabel={(sectionTitles.length > 1) ? null : 'Convert Beans'}
        // Sections
        handleTabChange={handleTabChange}
        section={section}
        sectionTitles={(sectionTitles.length > 1) ? sectionTitles : []}
        sectionTitlesDescription={sectionTitlesDescription}
      >
        {sections[section]}
        {showListTablesIcon}
      </BaseModule>
      {showListTables}
    </>
  );
}
