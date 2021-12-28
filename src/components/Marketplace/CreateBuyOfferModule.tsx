import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import {
  BEAN,
  ETH,
  SLIPPAGE_THRESHOLD,
} from 'constants/index';
import {
  buyAndDepositBeans,
  depositBeans,
  displayBN,
  getToAmount,
  MaxBN,
  smallDecimalPercent,
  SwapMode,
  toBaseUnitBN,
  toStringBaseUnitBN,
  TrimBN,
} from 'util/index';
import {
  CryptoAsset,
  ClaimTextModule,
  EthInputField,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  SiloAsset,
  TokenOutputField,
  TransactionTextModule,
  TransactionDetailsModule,
} from 'components/Common';

export const CreateBuyOfferModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));

  function fromValueUpdated(newFromNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      props.ethReserve,
      props.beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals));
    setFromBeanValue(TrimBN(newFromNumber, BEAN.decimals));
    const depositedBeans = MaxBN(buyBeans, new BigNumber(0)).plus(
      MaxBN(newFromNumber, new BigNumber(0))
    );
  }

  /* Input Fields */

  const fromBeanField = (
    <InputFieldPlus
      key={0}
      balance={props.beanBalance}
      claim={props.settings.claim}
      claimableBalance={props.beanClaimableBalance}
      beanLPClaimableBalance={props.beanLPClaimableBalance}
      handleChange={(v) => {
        fromValueUpdated(v, fromEthValue);
      }}
      token={CryptoAsset.Bean}
      value={fromBeanValue}
      visible={props.settings.mode !== SwapMode.Ethereum}
    />
  );
  const fromEthField = (
    <EthInputField
      key={1}
      balance={props.ethBalance}
      buyBeans={toBuyBeanValue}
      claim={props.settings.claim}
      claimableBalance={props.claimableEthBalance}
      handleChange={(v) => {
        fromValueUpdated(fromBeanValue, v);
      }}
      mode={props.settings.mode}
      sellEth={fromEthValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  );

  /* Transaction Details, settings and text */

  const details = [];
  if (props.settings.claim) {
    details.push(
      <ClaimTextModule
        key="claim"
        balance={props.beanClaimable.plus(props.ethClaimable)}
        claim={props.settings.claim}
        mode={props.settings.mode}
        beanClaimable={props.beanClaimable}
        ethClaimable={props.ethClaimable}
      />
    );
  }
  if (
    props.settings.mode === SwapMode.Ethereum ||
    (props.settings.mode === SwapMode.BeanEthereum &&
      toBuyBeanValue.isGreaterThan(0))
  ) {
    details.push(
      <TransactionTextModule
        key="buy"
        balance={toBuyBeanValue}
        buyBeans={toBuyBeanValue}
        claim={props.settings.claim}
        claimableBalance={props.claimableEthBalance}
        mode={props.settings.mode}
        sellEth={fromEthValue}
        updateExpectedPrice={props.updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
  }
  const beanOutput = MaxBN(toBuyBeanValue, new BigNumber(0)).plus(
    MaxBN(fromBeanValue, new BigNumber(0))
  );

  details.push(`Deposit ${displayBN(beanOutput)}
    ${beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'} in the Silo`);

  const frontrunTextField =
    props.settings.mode !== SwapMode.Bean &&
    props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD) ? (
      <FrontrunText />
    ) : null;
  const showSettings = (
    <SettingsFormModule
      setSettings={props.setSettings}
      settings={props.settings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={props.hasClaimable}
      hasSlippage
    />
  );
  function transactionDetails() {
    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <p>hi</p>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          <p>hi</p>
        </Box>
        <TransactionDetailsModule fields={details} />
        <Box
          style={{
            display: 'inline-block',
            width: '100%',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          <span>
            hi
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      const claimable = props.settings.claim ? props.claimable : null;
      if (fromEthValue.isGreaterThan(0)) {
        const beans = MaxBN(
          toBaseUnitBN(fromBeanValue, BEAN.decimals),
          new BigNumber(0)
        ).toString();
        const eth = toStringBaseUnitBN(fromEthValue, ETH.decimals);
        const buyBeans = toStringBaseUnitBN(
          toBuyBeanValue.multipliedBy(props.settings.slippage),
          BEAN.decimals
        );
        buyAndDepositBeans(beans, buyBeans, eth, claimable, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
        });
      } else {
        depositBeans(
          toStringBaseUnitBN(fromBeanValue, BEAN.decimals),
          claimable,
          () => {
            fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
          }
        );
      }
    },
  }));

  return (
    <>
      {fromBeanField}
      {fromEthField}
      {transactionDetails()}
      {frontrunTextField}
      {showSettings}
    </>
  );
});
