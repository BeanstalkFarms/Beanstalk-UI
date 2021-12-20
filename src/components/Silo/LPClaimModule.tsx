import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, UNI_V2_ETH_BEAN_LP } from 'constants/index';
import {
  claimLP,
  displayBN,
  removeAndClaimLP,
  TokenLabel,
  TrimBN,
} from 'util/index';
import {
  ClaimableAsset,
  CryptoAsset,
  SettingsFormModule,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';
import { useLatestTransactionNumber } from 'state/general/hooks';
import {
  addTransaction,
  completeTransaction,
  State,
} from 'state/general/actions';

export const LPClaimModule = forwardRef((props, ref) => {
  const [settings, setSettings] = useState({ removeLP: true });
  props.setIsFormDisabled(props.maxFromLPVal.isLessThanOrEqualTo(0));
  const dispatch = useDispatch();
  const latestTransactionNumber = useLatestTransactionNumber();

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
    return `${displayBN(balance[0])} ${TokenLabel(
      CryptoAsset.Bean
    )} and ${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const details = [];
  details.push(
    `Claim ${displayBN(
      new BigNumber(props.maxFromLPVal)
    )} LP Tokens from the Silo`
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
        )} LP Tokens from the BEAN:ETH LP pool`
      );
      details.push(
        `Receive ${displayLP(props.poolForLPRatio(props.maxFromLPVal))}`
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
        const transactionNumber = latestTransactionNumber + 1;
        dispatch(
          addTransaction({
            transactionNumber,
            description: 'Remove and claiming LP beans...',
            state: State.PENDING,
          })
        );
        removeAndClaimLP(
          Object.keys(props.crates),
          '0',
          '0',
          () => {},
          () => {
            dispatch(completeTransaction(transactionNumber));
          }
        );
      } else {
        const transactionNumber = latestTransactionNumber + 1;
        dispatch(
          addTransaction({
            transactionNumber,
            description: 'Claiming LP beans...',
            state: State.PENDING,
          })
        );
        claimLP(
          Object.keys(props.crates),
          () => {},
          () => {
            dispatch(completeTransaction(transactionNumber));
          }
        );
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
