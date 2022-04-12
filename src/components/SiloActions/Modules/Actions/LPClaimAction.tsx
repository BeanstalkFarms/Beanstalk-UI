import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
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
  TransactionToast,
} from 'components/Common';

const LPClaimAction = forwardRef(({
  setIsFormDisabled,
  poolForLPRatio,
}, ref) => {
  const [settings, setSettings] = useState({ removeLP: true });

  const {
    lpReceivableBalance,
    lpReceivableCrates,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  setIsFormDisabled(lpReceivableBalance.isLessThanOrEqualTo(0));

  /* Input Fields */
  const fromLPField = (
    <TokenInputField
      balance={lpReceivableBalance}
      isLP
      poolForLPRatio={poolForLPRatio}
      token={ClaimableAsset.LP}
      value={TrimBN(lpReceivableBalance, UNI_V2_ETH_BEAN_LP.decimals)}
    />
  );

  /* Output Fields */
  const toLPField = (
    <TokenOutputField mint token={CryptoAsset.LP} value={lpReceivableBalance} />
  );
  const toLPBeanField = (
    <TokenOutputField
      decimals={BEAN.decimals}
      mint
      token={CryptoAsset.Bean}
      value={poolForLPRatio(lpReceivableBalance)[0]}
    />
  );
  const toLPEthField = (
    <TokenOutputField
      decimals={9}
      mint
      token={CryptoAsset.Ethereum}
      value={poolForLPRatio(lpReceivableBalance)[1]}
    />
  );

  /* Transaction Details, settings and text */
  function displayLP(balance) {
    return `${displayBN(balance[0])} ${TokenLabel(
      CryptoAsset.Bean
    )} and ${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const details = [
    `Claim ${displayBN(
      new BigNumber(lpReceivableBalance)
    )} LP Tokens from the Silo`,
  ];

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
          lpReceivableBalance
        )} LP Tokens from the BEAN:ETH LP pool`
      );
      details.push(
        `Receive ${displayLP(poolForLPRatio(lpReceivableBalance))}`
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
      if (lpReceivableBalance.isLessThanOrEqualTo(0)) return null;

      if (settings.removeLP) {
        // Toast
        const txToast = new TransactionToast({
          loading: `Removing and claiming ${displayBN(lpReceivableBalance)} LP Tokens`,
          success: `Removed and claimed ${displayBN(lpReceivableBalance)} LP Tokens`,
        });

        // Execute
        removeAndClaimLP(
          Object.keys(lpReceivableCrates),
          '0',
          '0',
          (response) => {
            txToast.confirming(response);
          }
        )
        .then((value) => {
          txToast.success(value);
        })
        .catch((err) => {
          txToast.error(err);
        });
      } else {
        // Toast
        const txToast = new TransactionToast({
          loading: `Claiming ${displayBN(lpReceivableBalance)} BEAN:ETH LP Tokens`,
          success: `Claimed ${displayBN(lpReceivableBalance)} BEAN:ETH LP Tokens`,
        });

        // Execute
        claimLP(
          Object.keys(lpReceivableCrates),
          (response) => {
            txToast.confirming(response);
          }
        )
        .then((value) => {
          txToast.success(value);
        })
        .catch((err) => {
          txToast.error(err);
        });
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

export default LPClaimAction;
