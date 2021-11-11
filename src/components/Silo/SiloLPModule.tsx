import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { IconButton, Box } from '@material-ui/core';
import { AppState } from 'state';
import { List as ListIcon } from '@material-ui/icons';
import { updateBeanstalkBeanAllowance, updateBeanstalkLPAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE, LPBEAN_TO_STALK } from '../../constants';
import {
  approveBeanstalkBean,
  approveBeanstalkLP,
  SwapMode,
} from '../../util';
import {
  BaseModule,
  ListTable,
  SiloAsset,
  TransitAsset,
} from '../Common';
import { LPClaimModule } from './LPClaimModule';
import { LPDepositModule } from './LPDepositModule';
import { LPWithdrawModule } from './LPWithdrawModule';

export default function SiloLPModule(props) {
  const { beanstalkBeanAllowance, beanstalkLPAllowance } = useSelector<AppState, AppState['allowances']>(
    (state) => state.allowances
  );
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

  const sectionTitles = ['Deposit', 'Withdraw'];

  const sectionTitlesDescription = [
    // eslint-disable-next-line
    'Use this sub-tab to deposit LP Tokens to the Silo. You can toggle the settings to deposit from Beans, ETH, or both and to convert Deposited Beans to Deposited LP Tokens.',
    'Use this sub-tab to withdraw LP Tokens from the Silo. Withdrawals will be claimable 24 full Seasons after withdrawal.',
  ];
  const sectionTitlesInfoDescription = [
    'View all your current LP Token Deposits in this table.',
    'View all your current LP Token Withdrawals in this table.',
  ];

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  if (settings.mode === null) {
    if (props.lpBalance.isGreaterThan(0)) setSettings((p) => ({ ...p, mode: SwapMode.LP }));
    else if (
      props.beanBalance.isGreaterThan(0) &&
      props.ethBalance.isGreaterThan(0)
    ) {
      setSettings((p) => ({ ...p, mode: SwapMode.BeanEthereum }));
    } else if (props.beanBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Bean }));
    } else if (props.ethBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    } else if (props.beanBalance.isEqualTo(0) && props.ethBalance.isEqualTo(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    }
  }

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
  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
    }
  };
  const claimLPBeans = props.lpReceivableBalance.isGreaterThan(0) ?
    props.poolForLPRatio(props.lpReceivableBalance)[0]
    : new BigNumber(0);

  const beanClaimable = props.beanReceivableBalance
    .plus(props.harvestablePodBalance)
    .plus(props.poolForLPRatio(props.lpReceivableBalance)[0]);

  const ethClaimable = props.claimableEthBalance
    .plus(props.poolForLPRatio(props.lpReceivableBalance)[1]);

  const sections = [
    <LPDepositModule
      key={0}
      beanClaimable={beanClaimable}
      ethClaimable={ethClaimable}
      beanBalance={props.beanBalance}
      beanCrates={props.beanDeposits}
      beanReceivableBalance={props.beanReceivableBalance}
      beanReserve={props.beanReserve}
      beanToEth={props.ethReserve.dividedBy(props.beanReserve)}
      beanToStalk={LPBEAN_TO_STALK}
      claimable={props.claimable}
      claimableEthBalance={props.claimableEthBalance}
      ethBalance={props.ethBalance}
      ethReserve={props.ethReserve}
      ethToBean={props.beanReserve.dividedBy(props.ethReserve)}
      harvestablePodBalance={props.harvestablePodBalance}
      hasClaimable={props.hasClaimable}
      lpBalance={props.lpBalance}
      lpReceivableBalance={props.lpReceivableBalance}
      updateExpectedPrice={props.updateExpectedPrice}
      maxFromBeanSiloVal={props.beanSiloBalance}
      beanClaimableBalance={props.beanClaimableBalance.plus(claimLPBeans)}
      beanLPClaimableBalance={claimLPBeans}
      poolForLPRatio={props.poolForLPRatio}
      ref={depositRef}
      season={props.season}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      totalLP={props.totalLP}
      totalStalk={props.totalStalk}
    />,
    <LPWithdrawModule
      key={1}
      beanClaimable={beanClaimable}
      ethClaimable={ethClaimable}
      beanReceivableBalance={props.beanReceivableBalance}
      claimable={props.claimable}
      claimableEthBalance={props.claimableEthBalance}
      crates={props.lpDeposits}
      harvestablePodBalance={props.harvestablePodBalance}
      hasClaimable={props.hasClaimable}
      lpReceivableBalance={props.lpReceivableBalance}
      locked={section === 1 && props.locked}
      maxFromLPVal={props.lpSiloBalance}
      maxToSeedsVal={props.seedBalance}
      maxToStalkVal={props.stalkBalance}
      poolForLPRatio={props.poolForLPRatio}
      ref={withdrawRef}
      season={props.season}
      seedCrates={props.lpSeedDeposits}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      totalLP={props.totalLP}
      totalStalk={props.totalStalk}
    />,
  ];
  if (props.lpReceivableBalance.isGreaterThan(0)) {
    sections.push(
      <LPClaimModule
        key={2}
        // claimableEthBalance={props.claimableEthBalance}
        crates={props.lpReceivableCrates}
        maxFromLPVal={props.lpReceivableBalance}
        poolForLPRatio={props.poolForLPRatio}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
      />
    );
    sectionTitles.push('Claim');
    sectionTitlesDescription.push(
      'Use this sub-tab to Claim Withrawn LP Tokens from the Silo.'
    );
  }
  if (section > sectionTitles.length - 1) setSection(0);

  const sectionTitlesInfo = [];
  const sectionsInfo = [];
  if (
    props.lpDeposits !== undefined &&
    Object.keys(props.lpDeposits).length > 0
  ) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.LP}
        crates={props.lpDeposits}
        description="LP Deposits Will Appear Here"
        handleChange={handlePageChange}
        indexTitle="Season"
        isLP
        page={page}
        poolForLPRatio={props.poolForLPRatio}
        season={props.season}
        seedCrates={props.lpSeedDeposits}
        title="Deposits"
      />
    );
    sectionTitlesInfo.push('LP Deposits');
  }
  if (
    (props.lpWithdrawals !== undefined &&
      Object.keys(props.lpWithdrawals).length > 0) ||
    props.lpReceivableBalance.isGreaterThan(0)
  ) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.LP}
        crates={props.lpWithdrawals}
        claimableBalance={props.lpReceivableBalance}
        claimableCrates={props.lpReceivableCrates}
        description="Bean Withdrawals Will Appear Here"
        handleChange={handlePageChange}
        index={props.season}
        indexTitle="Seasons to Arrival"
        isLP
        page={page}
        poolForLPRatio={props.poolForLPRatio}
        title="Withdrawals"
      />
    );
    sectionTitlesInfo.push('LP Withdrawals');
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
          setSettings({ ...settings, mode: SwapMode.Ethereum });
        }}
        handleApprove={handleApprove}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled}
        locked={section === 1 && props.locked}
        lockedSeasons={props.lockedSeasons}
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
