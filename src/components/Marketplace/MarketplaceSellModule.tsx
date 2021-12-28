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
  FarmAsset,
  CryptoAsset,
} from 'util/index';
import {
  BaseModule,
  ListTable,
  siloStrings,
} from 'components/Common';
import { PlotSellModule } from './PlotSellModule';
import Offers from './Offers';
import CreateListingModule from './CreateListingModule';

export default function MarketplaceSellModule() {
  // Global state
  const {
    lpBalance,
    beanBalance,
    ethBalance,
    locked,
    lockedSeasons,
    harvestablePodBalance,
    plots,
    harvestablePlots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );

  // Local state
  const [section, setSection] = useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);

  // Handlers
  const handleTabChange = (event, newSection) => {
    setSection(newSection)
  };

  const sectionTitles = ['Offers', 'Sell Plot'];
  const sectionTitlesDescription = [
    siloStrings.lpDeposit, // FIXME
    siloStrings.lpDeposit, // FIXME
  ];

  const sections = [
    <Offers
    />,
    <CreateListingModule
      plots={plots}
      hasPlots={
        plots !== undefined &&
        (Object.keys(plots).length > 0 ||
          harvestablePodBalance.isGreaterThan(0))
      }
      index={parseFloat(harvestableIndex)}
    />,
  ];

  // Render
  return (
    <>
      <BaseModule
        style={{ marginTop: '20px' }}
        handleForm={() => {}}
        handleTabChange={handleTabChange}
        isDisabled={false}
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        showButton={section === 1}
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
