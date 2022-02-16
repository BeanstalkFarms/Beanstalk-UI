import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ReactComponent as UniswapIcon } from 'img/uniswap-logo-black.svg';
import { ReactComponent as CurveIcon } from 'img/curve-logo.svg';
import { ReactComponent as UpRightArrowIcon } from 'img/up-right-arrow.svg';
import { SectionTabs } from 'components/Common';
import Curve from 'components/Curve/CurveModule';
import SiloLPModule from './SiloLPModule';

export default function SiloSelectLPModule() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const [section, setSection] = useState(0);
  const sections = [<SiloLPModule />, <Curve />];

  const logoStyle = {
    height: '20px',
    width: '20px',
  };

  const uniPool = (
    <Box style={{ display: 'flex', alignItems: 'center' }}>
      <UniswapIcon style={logoStyle} />
      {width > 600 ?
        <>
          <Box style={{ fontSize: '14px', paddingLeft: '5px' }}>Uniswap V2 Pool</Box>
          <UpRightArrowIcon style={{ height: '10px' }} />
        </>
        : null}
    </Box>
  );
  const curvePool = (
    <Box style={{ display: 'flex', alignItems: 'center' }}>
      <CurveIcon style={logoStyle} />
      {width > 600 ?
        <>
          <Box style={{ fontSize: '14px', paddingLeft: '5px' }}>Curve Pool</Box>
          <UpRightArrowIcon style={{ height: '10px' }} />
        </>
        : null}
    </Box>
  );

  const sectionTitles = [uniPool, curvePool];

  return (
    <>
      <SectionTabs
        setSection={setSection}
        section={section}
        sectionTitles={sectionTitles}
        minWidth={width > 600 ? '400px' : '200px'}
      />
      {sections[section]}
    </>
  );
}
