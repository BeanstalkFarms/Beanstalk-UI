import BigNumber from 'bignumber.js'
import React, { useState, useRef } from 'react'
import { IconButton } from '@material-ui/core'
import ListIcon from '@material-ui/icons/List'
import { BASE_SLIPPAGE, BEAN_TO_STALK } from '../../constants'
import { approveBeanstalkBean, SwapMode } from '../../util'
import {
  BaseModule,
  ListTable,
  SiloAsset,
  TransitAsset
} from '../Common'
import { BeanClaimSubModule } from './BeanClaimSubModule'
import { BeanDepositSubModule } from './BeanDepositSubModule'
import { BeanWithdrawSubModule } from './BeanWithdrawSubModule'

export default function SiloBeanModule(props) {
  const [section, setSection] = useState(0)
  const [sectionInfo, setSectionInfo] = useState(0)
  const [settings, setSettings] = useState({
    claim: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE)
  })
  const [page, setPage] = React.useState(0)

  const sectionTitles = ['Deposit', 'Withdraw']
  const sectionTitlesDescription = ['Use this sub-tab to Deposit Beans to the Silo. You can toggle the settings to Deposit from Beans, ETH, or both.', 'Use this sub-tab to Withdraw Beans from the Silo. Withdrawals will be Claimable 24 Full Seasons after Withdrawal.']

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
    if (props.beanBalance.isGreaterThan(0)) setSettings(p => {return {...p, mode: SwapMode.Bean}})
    else if (props.ethBalance.isGreaterThan(0)) setSettings(p => {return {...p, mode: SwapMode.Ethereum}})
    else if (props.beanBalance.isEqualTo(0) && props.ethBalance.isEqualTo(0)) setSettings(p => {return {...p, mode: SwapMode.Ethereum
    }})
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
    <BeanDepositSubModule
      key={0}
      beanBalance={props.beanBalance}
      beanClaimableBalance={props.beanClaimableBalance}
      beanReserve={props.beanReserve}
      beanToStalk={BEAN_TO_STALK}
      claimable={props.claimable}
      claimableEthBalance={props.claimableEthBalance}
      ethBalance={props.ethBalance}
      ethReserve={props.ethReserve}
      hasClaimable={props.hasClaimable}
      ref={depositRef}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      totalStalk={props.totalStalk}
      updateExpectedPrice={props.updateExpectedPrice}
    />,
    <BeanWithdrawSubModule
      key={1}
      claimable={props.claimable}
      crates={props.beanDeposits}
      hasClaimable={props.hasClaimable}
      locked={section === 1 && props.locked}
      maxFromBeanVal={props.beanSiloBalance}
      maxFromSeedsVal={props.seedBalance}
      maxFromStalkVal={props.stalkBalance}
      ref={withdrawRef}
      season={props.season}
      setIsFormDisabled={setIsFormDisabled}
      setSection={setSection}
      setSettings={setSettings}
      settings={settings}
      totalStalk={props.totalStalk}
    />
  ]
  if (props.beanReceivableBalance.isGreaterThan(0)) {
    sections.push(
      <BeanClaimSubModule
        key={2}
        crates={props.beanReceivableCrates}
        maxFromBeansVal={props.beanReceivableBalance}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
      />
    )
    sectionTitles.push('Claim')
    sectionTitlesDescription.push('Use this sub-tab to Claim Withrawn LP Tokens from the Silo.')
  }
  if (section > sectionTitles.length - 1) setSection(0)

  var sectionTitlesInfo = []
  var sectionsInfo = []
  if (props.beanDeposits !== undefined && Object.keys(props.beanDeposits).length > 0) {
    sectionsInfo.push(
      <ListTable
        asset={SiloAsset.Bean}
        description='Bean Deposits Will Appear Here'
        claimableBalance={props.farmableBeanBalance}
        claimableStalk={props.farmableStalkBalance.plus(props.farmableBeanBalance)}
        crates={props.rawBeanDeposits}
        handleChange={handlePageChange}
        indexTitle='Season'
        page={page}
        season={props.season}
        title='Deposits'
      />
    )
    sectionTitlesInfo.push('Bean Deposits')
  }
  if ((props.beanWithdrawals !== undefined
      && Object.keys(props.beanWithdrawals).length > 0)
      ||  props.beanReceivableBalance.isGreaterThan(0)) {
    sectionsInfo.push(
      <ListTable
        asset={TransitAsset.Bean}
        crates={props.beanWithdrawals}
        claimableBalance={props.beanReceivableBalance}
        claimableCrates={props.beanReceivableCrates}
        description='Bean Withdrawals Will Appear Here'
        handleChange={handlePageChange}
        index={props.season}
        indexTitle='Seasons to Arrival'
        page={page}
        title='Withdrawals'
      />
    )
    sectionTitlesInfo.push('Bean Withdrawals')
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

  const allowance = (
    (settings.mode === SwapMode.Bean || settings.mode === SwapMode.BeanEthereum)
    && section === 0
      ? props.beanstalkBeanAllowance
      : new BigNumber(1)
  )

  return (
    <>
    <BaseModule
      style={{marginTop: '20px'}}
      allowance={allowance}
      resetForm={() => { setSettings({...settings, mode: SwapMode.Ethereum}) }}
      handleApprove={approveBeanstalkBean}
      handleForm={handleForm}
      handleTabChange={handleTabChange}
      isDisabled={isFormDisabled}
      locked={section === 1 && props.locked}
      lockedSeasons={props.lockedSeasons}
      mode={settings.mode}
      section={section}
      sectionTitles={sectionTitles}
      sectionTitlesDescription={sectionTitlesDescription}
      setAllowance={props.setBeanstalkBeanAllowance}
    >
      {sections[section]}
      {showListTablesIcon}
    </BaseModule>
    {showListTables}
    </>
  )
}
