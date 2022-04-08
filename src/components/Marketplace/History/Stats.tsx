import React from 'react';
import { Box, Divider } from '@material-ui/core';
import TokenIcon from 'components/Common/TokenIcon';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { CryptoAsset, displayBN, FarmAsset } from 'util/index';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    outerBox: {
        flex: 1, textAlign: 'center'
    },
    labelBox: {
        fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12
    },
    childBox: {
        fontSize: 20
    }
});

export default function HistoryModule() {
  const classes = useStyles();
  const { stats } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  function Stat({ label, children }) {
      return (
        <Box className={classes.outerBox} p={1}>
          <Box className={classes.labelBox} mb={0.5}>{label}</Box>
          <Box className={classes.childBox}>{children}</Box>
        </Box>
      );
    }

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
