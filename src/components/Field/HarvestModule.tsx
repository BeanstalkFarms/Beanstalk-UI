import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BEAN } from '../../constants';
import {
  displayBN,
  harvest,
  toStringBaseUnitBN,
  TrimBN,
} from '../../util';
import {
  CryptoAsset,
  FarmAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from '../Common';

export const HarvestModule = forwardRef((props, ref) => {
  props.setIsFormDisabled(props.harvestablePodBalance.isLessThanOrEqualTo(0));

  /* Input Fields */

  const fromPodField = (
    <TokenInputField
      balance={props.harvestablePodBalance}
      token={FarmAsset.Pods}
      value={TrimBN(props.harvestablePodBalance, 6)}
    />
  );

  /* Output Fields */

  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(props.harvestablePodBalance, BEAN.decimals)}
    />
  );

  /* Transaction Details, settings and text */
  const details = [];
  details.push(`- Harvest ${displayBN(props.harvestablePodBalance)} Pods`);
  details.push(`- Receive ${displayBN(
    props.harvestablePodBalance)} Beans`
  );

  function transactionDetails() {
    if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toBeanField}
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return;

      harvest(Object.keys(props.harvestablePlots).map((key) => (
        toStringBaseUnitBN(new BigNumber(key), BEAN.decimals)
      )), () => {});
    },
  }));

  return (
    <>
      {fromPodField}
      {transactionDetails()}
    </>
  );
});
