import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, UNI_V2_ETH_BEAN_LP } from '../../constants';
import {
  claimLP,
  displayBN,
  removeAndClaimLP,
  TokenLabel,
  TrimBN,
} from '../../util';
import {
  ClaimableAsset,
  CryptoAsset,
  SettingsFormModule,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from '../Common';

export const LPClaimModule = forwardRef((props, ref) => {
  const [settings, setSettings] = useState({ removeLP: true });
  props.setIsFormDisabled(props.maxFromLPVal.isLessThanOrEqualTo(0));

  /* Input Fields */

  const fromLPField = (
    <TokenInputField
      balance={props.maxFromLPVal}
      isLP
      poolForLPRatio={props.poolForLPRatio}
      token={ClaimableAsset.LP}
      value={TrimBN(props.maxFromLPVal, UNI_V2_ETH_BEAN_LP.decimals)}
    />
  );

  /* Output Fields */

  const toLPField = (
    <TokenOutputField mint token={CryptoAsset.LP} value={props.maxFromLPVal} />
  );
  const toLPBeanField = (
    <TokenOutputField
      decimals={BEAN.decimals}
      mint
      token={CryptoAsset.Bean}
      value={props.poolForLPRatio(props.maxFromLPVal)[0]}
    />
  );
  const toLPEthField = (
    <TokenOutputField
      decimals={9}
      mint
      token={CryptoAsset.Ethereum}
      value={props.poolForLPRatio(props.maxFromLPVal)[1]}
    />
  );

  /* Transaction Details, settings and text */
  function displayLP(balance) {
    return (
      `${displayBN(balance[0])} ${TokenLabel(
        CryptoAsset.Bean
      )} and ${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`
    );
  }

  const details = [];
  details.push(
    `Claim ${displayBN(
      new BigNumber(props.maxFromLPVal)
    )} LP Tokens from the Silo.`
  );

  const showSettings = (
    <SettingsFormModule
      hasRemoveLP
      margin="12px 4px -56px 0"
      setSettings={setSettings}
      settings={settings}
      showUnitModule={false}
    />
  );

  function transactionDetails() {
    if (settings.removeLP) {
      details.push(
        `Remove ${displayBN(
          props.maxFromLPVal
        )} LP Tokens from the BEAN:ETH LP pool and receive ${displayLP(
          props.poolForLPRatio(props.maxFromLPVal)
        )}.`
      );

      return (
        <>
          <ExpandMoreIcon
            color="primary"
            style={{ marginBottom: '-14px', width: '100%' }}
          />
          <Box style={{ display: 'inline-flex' }}>
            <Box style={{ marginRight: '5px' }}>{toLPBeanField}</Box>
            <Box style={{ marginLeft: '5px' }}>{toLPEthField}</Box>
          </Box>
          <TransactionDetailsModule fields={details} />
        </>
      );
    }

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toLPField}
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.maxFromLPVal.isLessThanOrEqualTo(0)) return;

      if (settings.removeLP) {
        removeAndClaimLP(Object.keys(props.crates), '0', '0', () => {});
      } else {
        claimLP(Object.keys(props.crates), () => {});
      }
    },
  }));

  return (
    <>
      {fromLPField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});
