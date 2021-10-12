import BigNumber from 'bignumber.js'
import React, { useState, useRef } from 'react'
import { IconButton } from '@material-ui/core'
import ListIcon from '@material-ui/icons/List'
import { BASE_SLIPPAGE } from '../../constants'
import { approveBeanstalkBean, SwapMode } from '../../util'
import { CryptoAsset, BaseModule, FarmAsset, ListTable } from '../Common'
import { SowModule } from './SowModule'
import { HarvestModule } from './HarvestModule'
import { SendPlotModule } from './SendPlotModule'

export default function FieldModule(props) {

  const [section, setSection] = useState(0)
  const [sectionInfo, setSectionInfo] = useState(0)
  const [page, setPage] = React.useState(0)

  const [settings, setSettings] = useState({
    claim: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE),
  })

  const [toAddress, setToAddress] = useState('')

  const sectionTitles = ['Sow']
  const sectionTitlesDescription = ['Use this tab to sow Beans in the Field in exchange for Pods.']

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
    else if (props.beanBalance.isEqualTo(0) && props.ethBalance.isEqualTo(0)) setSettings(p => {return {...p, mode: SwapMode.Ethereum}})
  }

  const sowRef = useRef<any>()
  const sendRef = useRef<any>()
  const harvestRef = useRef<any>()
  function handleForm() {
    switch (section) {
      case 0: sowRef.current.handleForm(); break
      case 1: sendRef.current.handleForm(); break
      case 2: harvestRef.current.handleForm(); break
      default: break
    }
  }

  const [isFormDisabled, setIsFormDisabled] = useState(true)
  let sections = [
    <SowModule
      key={0}
      unripenedPods={props.unripenedPods}
      beanBalance={props.beanBalance}
      beanClaimableBalance={props.beanClaimableBalance}
      beanReserve={props.beanReserve}
      claimable={props.claimable}
      claimableEthBalance={props.claimableEthBalance}
      ethBalance={props.ethBalance}
      ethReserve={props.ethReserve}
      hasClaimable={props.hasClaimable}
      ref={sowRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings}
      settings={settings}
      soil={props.soil}
      updateExpectedPrice={props.updateExpectedPrice}
      weather={props.weather}
    />]
  if (props.harvestablePodBalance.isGreaterThan(0)) {
    sections.push(
      <HarvestModule
        key={1}
        harvestablePlots={props.harvestablePlots}
        harvestablePodBalance={props.harvestablePodBalance}
        ref={harvestRef}
        setIsFormDisabled={setIsFormDisabled}
        setSection={setSection}
      />
    )
    sectionTitles.push('Harvest')
    sectionTitlesDescription.push('Use this tab to Harvest Pods. You can also toggle the "Claim" setting on in the Silo or Field modules to Harvest and use your Pods in a single transaction.')
  }
  if (Object.keys(props.plots).length > 0) {
    sections.push(
    <SendPlotModule
      key={2}
      plots={props.plots}
      hasPlots={props.plots !== undefined && (Object.keys(props.plots).length > 0 || props.harvestablePodBalance.isGreaterThan(0))}
      index={parseFloat(props.harvestableIndex)}
      fromAddress={props.address}
      fromToken={CryptoAsset.Bean}
      ref={sendRef}
      setIsFormDisabled={setIsFormDisabled}
      setToAddress={setToAddress}
      setSection={setSection}
      toAddress={toAddress}
    />)
    sectionTitles.push('Send')
    sectionTitlesDescription.push('Use this tab to send Plots to another Ethereum address.')
  }
  if (section > sectionTitles.length - 1) setSection(0)

  var sectionTitlesInfo = []
  var sectionsInfo = []
  if (props.plots !== undefined && (Object.keys(props.plots).length > 0 || props.harvestablePodBalance.isGreaterThan(0))) {
    sectionsInfo.push(
      <ListTable
        asset={FarmAsset.Pods}
        claimableBalance={props.harvestablePodBalance}
        claimableCrates={props.harvestablePlots}
        crates={props.plots}
        description='Sown Plots will show up here.'
        handleChange={handlePageChange}
        indexTitle='Place in Line'
        index={parseFloat(props.harvestableIndex)}
        page={page}
        title='Plots'
      />
    )
    sectionTitlesInfo.push('Plots')
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
            sectionTitlesDescription={['A Plot of Pods is created every time Beans are Sown. Plots have a place in the Pod Line based on the order they were created. As Pods are harvested, your Plots will automatically advance in line. Entire Plots and sections of Plots can be transferred using the Send tab of the Field module.']}
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
      allowance={allowance}
      resetForm={() => { setSettings({...settings, mode: SwapMode.Ethereum}) }}
      handleApprove={approveBeanstalkBean}
      handleForm={handleForm}
      handleTabChange={handleTabChange}
      isDisabled={isFormDisabled && sectionTitles[section] !== 'Harvest'}
      marginTop='14px'
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
