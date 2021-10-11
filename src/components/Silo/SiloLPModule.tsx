import BigNumber from 'bignumber.js'
import React, { useRef, useState } from 'react'
import { IconButton } from '@material-ui/core'
import ListIcon from '@material-ui/icons/List'
import { BASE_SLIPPAGE, LPBEAN_TO_STALK } from '../../constants'
import { approveBeanstalkBean, approveBeanstalkLP, SwapMode } from '../../util'
import {
  ListTable,
  BaseModule,
  SiloAsset,
  TransitAsset
} from '../Common'
import { LPClaimSubModule } from './LPClaimSubModule'
import { LPDepositSubModule } from './LPDepositSubModule'
import { LPWithdrawSubModule } from './LPWithdrawSubModule'

export default function SiloLPModule(props) {
  const [section, setSection] = useState(0)
  const [sectionInfo, setSectionInfo] = useState(0)
  const [settings, setSettings] = useState({
    claim: false,
    convert: false,
    useLP: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE)
  })
  const [page, setPage] = React.useState(0)

  const sectionTitles = ['Deposit', 'Withdraw']
  const sectionTitlesDescription = ['Use this sub-tab to Deposit LP tokens to the Silo. You can toggle the settings to deposit from Beans, ETH, or both.', 'LP Withdraw Description - unique1234']

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection)
      setIsFormDisabled(true)
    }
  }
  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo)
    setPage(newPageZero)
  }
  const handlePageChange = (event, newPage) => { setPage(newPage) }

  if (settings.mode === null) {
    if (props.lpBalance.isGreaterThan(0)) setSettings(p => {return {...p, mode: SwapMode.LP}})
    else if (props.beanBalance.isGreaterThan(0) && props.ethBalance.isGreaterThan(0)) setSettings(p => {return {...p, mode: SwapMode.BeanEthereum}})
    else if (props.beanBalance.isGreaterThan(0)) setSettings(p => {return {...p, mode: SwapMode.Bean}})
    else if (props.ethBalance.isGreaterThan(0)) setSettings(p => {return {...p, mode: SwapMode.Ethereum}})
    else if (props.beanBalance.isEqualTo(0) && props.ethBalance.isEqualTo(0)) setSettings(p => {return {...p, mode: SwapMode.Ethereum}})
  }

  const depositRef = useRef<any>()
  const withdrawRef = useRef<any>()
  const claimRef = useRef<any>()
  function handleForm() {
    switch (section) {
      case 0: depositRef.current.handleForm(); break
      case 1: withdrawRef.current.handleForm(); break
      case 2: claimRef.current.handleForm(); break
      default: break
    }
  }
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  let sections = [
      <LPDepositSubModule
        beanBalance={props.beanBalance}
        beanCrates={props.beanDeposits}
        beanReserve={props.beanReserve}
        beanToEth={props.ethReserve.dividedBy(props.beanReserve)}
        beanToStalk={LPBEAN_TO_STALK}
        claimable={props.claimable}
        claimableEthBalance={props.claimableEthBalance}
        ethBalance={props.ethBalance}
        ethReserve={props.ethReserve}
        ethToBean={props.beanReserve.dividedBy(props.ethReserve)}
        hasClaimable={props.hasClaimable}
        lpBalance={props.lpBalance}
        updateExpectedPrice={props.updateExpectedPrice}
        maxFromBeanSiloVal={props.beanSiloBalance}
        maxFromClaimableVal={props.beanClaimableBalance}
        poolForLPRatio={props.poolForLPRatio}
        ref={depositRef}
        season={props.season}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
        setSettings={setSettings}
        settings={settings}
        totalLP={props.totalLP}
      />,
      <LPWithdrawSubModule
        claimable={props.claimable}
        crates={props.lpDeposits}
        hasClaimable={props.hasClaimable}
        locked={section === 1 && props.locked}
        maxFromClaimableVal={props.beanClaimableBalance}
        maxFromLPVal={props.lpSiloBalance}
        maxFromSeedsVal={props.seedBalance}
        maxFromStalkVal={props.stalkBalance}
        poolForLPRatio={props.poolForLPRatio}
        ref={withdrawRef}
        season={props.season}
        seedCrates={props.lpSeedDeposits}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
        setSettings={setSettings}
        settings={settings}
        totalLP={props.totalLP}
      />
    ]
  if (props.lpReceivableBalance.isGreaterThan(0)) {
    sections.push(
      <LPClaimSubModule
        crates={props.lpReceivableCrates}
        maxFromLPVal={props.lpReceivableBalance}
        poolForLPRatio={props.poolForLPRatio}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
      />
    )
    sectionTitles.push('Claim')
    sectionTitlesDescription.push('LP Claim Description - unique1234')
  }
  if (section > sectionTitles.length - 1) setSection(0)

  var sectionTitlesInfo = []
  var sectionsInfo = []
  if (props.lpDeposits !== undefined && Object.keys(props.lpDeposits).length > 0) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.LP}
        crates={props.lpDeposits}
        description='LP Deposits Will Appear Here'
        handleChange={handlePageChange}
        indexTitle='Season'
        isLP={true}
        page={page}
        poolForLPRatio={props.poolForLPRatio}
        season={props.season}
        seedCrates={props.lpSeedDeposits}
        title='Deposits'
      />
    )
    sectionTitlesInfo.push('LP Deposits')
  }
  if ((props.lpWithdrawals !== undefined && Object.keys(props.lpWithdrawals).length > 0) || props.lpReceivableBalance.isGreaterThan(0)) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.LP}
        crates={props.lpWithdrawals}
        claimableBalance={props.lpReceivableBalance}
        claimableCrates={props.lpReceivableCrates}
        description='Bean Withdrawals Will Appear Here'
        handleChange={handlePageChange}
        index={props.season}
        indexTitle='Seasons to Arrival'
        isLP={true}
        page={page}
        poolForLPRatio={props.poolForLPRatio}
        title='Withdrawals'
      />
    )
    sectionTitlesInfo.push('LP Withdrawals')
  }

  const showListTablesIcon = (
    sectionsInfo.length > 0
      ? <div style={{display: 'flex', justifyContent: 'flex-start', margin: '20px 0 -56px -4px'}}>
          <IconButton
            color='primary'
            onClick={() => {
              const shouldExpand = listTablesStyle.display === 'none'
              setListTablesStyle(shouldExpand ? {display: 'block'} : {display: 'none'})
            }}
            style={{height: '44px', width: '44px', marginTop: '-8px'}}
           >
           <ListIcon />
          </IconButton>
        </div>
      : null
  )

  const [listTablesStyle, setListTablesStyle] = useState({display: 'block'})
  const showListTables = (
    sectionsInfo.length > 0
      ? <div style={{...listTablesStyle, marginTop: '61px'}}>
          <BaseModule
            handleTabChange={handleTabInfoChange}
            section={sectionInfo}
            sectionTitles={sectionTitlesInfo}
            showButton={false}
          >
            {sectionsInfo[sectionInfo]}
          </BaseModule>
        </div>
      : null
  )

  let allowance = new BigNumber(1)
  let setAllowance = props.setBeanstalkBeanAllowance
  let handleApprove = approveBeanstalkBean
  if (settings.mode === SwapMode.Bean || settings.mode === SwapMode.BeanEthereum) {
    allowance = props.beanstalkBeanAllowance
    if (allowance.isGreaterThan(0) && settings.useLP) {
      allowance = props.beanstalkLPAllowance
      setAllowance = props.setBeanstalkLPAllowance
      handleApprove = approveBeanstalkLP
    }
  }
  else if (settings.mode === SwapMode.LP) {
    allowance = props.beanstalkLPAllowance
    setAllowance = props.setBeanstalkLPAllowance
    handleApprove = approveBeanstalkLP
  }

  return (
    <>
    <BaseModule
      style={{marginTop: '20px'}}
      allowance={section === 0 ? allowance : new BigNumber(1)}
      resetForm={() => { setSettings({...settings, mode: SwapMode.Ethereum}) }}
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
  )
}
