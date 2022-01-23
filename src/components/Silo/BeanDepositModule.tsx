import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import {
  BEAN,
  BEAN_TO_SEEDS,
  ETH,
  SEEDS,
  SLIPPAGE_THRESHOLD,
  STALK,
} from 'constants/index';
import {
  buyAndDepositBeans,
  depositBeans,
  displayBN,
  getToAmount,
  MaxBN,
  MinBN,
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
import TransactionToast from 'components/Common/TransactionToast';

export const BeanDepositModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));

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
    const newToStalkValue = TrimBN(
      depositedBeans.multipliedBy(props.beanToStalk),
      STALK.decimals
    );
    setToStalkValue(newToStalkValue);
    setToSeedsValue(
      TrimBN(depositedBeans.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals)
    );
    props.setIsFormDisabled(newToStalkValue.isLessThanOrEqualTo(0));
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

  /* Output Fields */

  const toStalkField = (
    <TokenOutputField
      decimals={4}
      mint
      token={SiloAsset.Stalk}
      value={toStalkValue}
    />
  );
  const toSeedsField = (
    <TokenOutputField
      decimals={4}
      mint
      token={SiloAsset.Seed}
      value={toSeedsValue}
    />
  );
  const toSiloBeanField = (
    <TokenOutputField
      mint
      token={SiloAsset.Bean}
      value={MaxBN(toBuyBeanValue, new BigNumber(0)).plus(
        MaxBN(fromBeanValue, new BigNumber(0))
      )}
    />
  );

  /* Transaction Details, settings and text */

  const details = [];
  if (props.settings.claim) {
    const claimedBeans = MinBN(fromBeanValue, props.beanClaimableBalance);
    details.push(
      <ClaimTextModule
        key="claim"
        balance={claimedBeans.plus(props.ethClaimable)}
        claim={props.settings.claim}
        mode={props.settings.mode}
        beanClaimable={claimedBeans}
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
  details.push(
    `Receive ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(
      new BigNumber(toSeedsValue)
    )} Seeds`
  );

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
  const stalkChangePercent = toStalkValue
    .dividedBy(props.totalStalk.plus(toStalkValue))
    .multipliedBy(100);

  function transactionDetails() {
    if (toStalkValue.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toSeedsField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toSiloBeanField}
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
            {`You will gain ${smallDecimalPercent(
              stalkChangePercent
            )}% ownership of Beanstalk.`}
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toStalkValue.isLessThanOrEqualTo(0)) return;
      const claimable = props.settings.claim ? props.claimable : null;
      
      if (fromEthValue.isGreaterThan(0)) {
        // Contract Inputs
        const beans = MaxBN(
          toBaseUnitBN(fromBeanValue, BEAN.decimals),
          new BigNumber(0)
        ).toString();
        const eth = toStringBaseUnitBN(fromEthValue, ETH.decimals);
        const buyBeans = toStringBaseUnitBN(
          toBuyBeanValue.multipliedBy(props.settings.slippage),
          BEAN.decimals
        );

        // Toast
        const txToast = new TransactionToast({
          loading: `Depositing ${toBuyBeanValue} Beans`,
          success: `Deposited ${toBuyBeanValue} Beans`,
        });

        // Execute
        buyAndDepositBeans(
          beans,
          buyBeans,
          eth,
          claimable,
          (response) => {
            fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
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
          loading: `Depositing ${fromBeanValue} Beans`,
          success: `Deposited ${fromBeanValue} Beans`,
        });

        // Execute
        depositBeans(
          toStringBaseUnitBN(fromBeanValue, BEAN.decimals),
          claimable,
          (response) => {
            fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
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
      {fromBeanField}
      {fromEthField}
      {transactionDetails()}
      {frontrunTextField}
      {showSettings}
    </>
  );
});
