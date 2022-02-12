import React from 'react';
import { Box, Divider } from '@material-ui/core';
import TokenIcon from 'components/Common/TokenIcon';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { CryptoAsset, displayBN, FarmAsset } from 'util/index';

function Stat({ label, children }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center' }} p={1}>
      <Box sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }} mb={0.5}>{label}</Box>
      <Box sx={{ fontSize: 20 }}>{children}</Box>
    </Box>
  );
}

export default function HistoryModule() {
  const { stats } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  return (
    <Box display="flex">
      <Stat label="Pods Transacted">
        {displayBN(stats.podVolume)} <TokenIcon token={FarmAsset.Pods} style={{ height: 18, width: 'auto' }} />
      </Stat>
      <Divider orientation="vertical" flexItem />
      <Stat label="Beans Exchanged">
        {displayBN(stats.beanVolume)} <TokenIcon token={CryptoAsset.Bean} style={{ height: 18, width: 'auto' }} />
      </Stat>
    </Box>
  );
}
