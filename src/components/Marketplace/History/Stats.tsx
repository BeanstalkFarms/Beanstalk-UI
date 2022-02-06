import React from 'react';
import { Chip, Grid } from '@material-ui/core';
import TokenIcon from 'components/Common/TokenIcon';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { CryptoAsset, displayBN, FarmAsset } from 'util/index';
import { useStyles } from '../TableStyles';

export default function HistoryModule() {
  const classes = useStyles();
  const { stats } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );

  return (
    <>
      <Grid container>
        <Grid item xs={4} style={{ textAlign: 'left' }}>
          <Chip
            label={(
              <>
                {stats.countFills.toFixed()} Transactions
              </>
            )}
          />
        </Grid>
        <Grid item xs={4} style={{ textAlign: 'center' }}>
          <Chip
            className={classes.lucidaStyle}
            label={(
              <>
                {displayBN(stats.podVolume)} <TokenIcon token={FarmAsset.Pods} />
              </>
            )}
          />
        </Grid>
        <Grid item xs={4} style={{ textAlign: 'right' }}>
          <Chip
            className={classes.lucidaStyle}
            label={(
              <>
                {displayBN(stats.beanVolume)} <TokenIcon token={CryptoAsset.Bean} />
              </>
            )}
          />
        </Grid>
      </Grid>
    </>
  );
}
