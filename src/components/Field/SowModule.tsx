import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Box } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BEAN, ETH, SLIPPAGE_THRESHOLD } from 'constants/index';
import {
  displayBN,
  buyAndSowBeans,
  getFromAmount,
  getToAmount,
  MaxBN,
  MinBNs,
  MinBN,
  sowBeans,
  SwapMode,
  toBaseUnitBN,
  toStringBaseUnitBN,
  TrimBN,
} from 'util/index';

import {
  ClaimTextModule,
  CryptoAsset,
  EthInputField,
  FarmAsset,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionTextModule,
} from 'components/Common';
import TransactionToast from 'components/Common/TransactionToast';

export const SowModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [toPodValue, setToPodValue] = useState(new BigNumber(0));

  const claimableFromVal = props.settings.claim
    ? props.beanClaimableBalance
    : 0;
  const maxFromVal = props.beanBalance.plus(claimableFromVal);
  const maxToVal = props.soil;

  function fromValueUpdated(newFromNumber, newEthFromNumber) {
    const newFromValue = MinBNs([newFromNumber, maxFromVal, maxToVal]);
    setFromBeanValue(TrimBN(newFromValue, 6));
    const newFromEthValue = MinBNs([
      newEthFromNumber,
      getFromAmount(
        maxToVal.minus(MaxBN(newFromValue, new BigNumber(0))),
        props.ethReserve,
        props.beanReserve,
        ETH.decimals
      ),
    ]);
    BigNumber.set({ DECIMAL_PLACES: 6 });
    const buyBeans = getToAmount(
      newFromEthValue,
      props.ethReserve,
      props.beanReserve
    );
    BigNumber.set({ DECIMAL_PLACES: 18 });
    setToBuyBeanValue(buyBeans);
    setFromEthValue(newFromEthValue);
    const sowedBeans = MaxBN(buyBeans, new BigNumber(0)).plus(
      MaxBN(newFromValue, new BigNumber(0))
    );
    setToPodValue(
      TrimBN(
        sowedBeans.multipliedBy(
          new BigNumber(1).plus(props.weather.dividedBy(100))
        ),
        6
      )
    );
    props.setIsFormDisabled(sowedBeans.isLessThanOrEqualTo(0));
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
      handleChange={(v) => fromValueUpdated(fromBeanValue, v)}
      mode={props.settings.mode}
      sellEth={fromEthValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  );

  /* Output Fields */

  const toPodField = (
    <TokenOutputField
      key="pods"
      token={FarmAsset.Pods}
      value={toPodValue}
      decimals={BEAN.decimals}
      mint
    />
  );

  /* Transaction Details, settings and text */

  const details = [];
  const claimedBeans = MinBN(fromBeanValue, props.beanClaimableBalance);
  if (props.settings.claim) {
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

  if (toBuyBeanValue.plus(fromBeanValue).isEqualTo(props.soil)) {
    details.push(`Sow maximum Soil ${displayBN(beanOutput)}
      ${
        beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'
      } with ${props.weather.toFixed()}% Weather`);
  } else {
    details.push(`Sow ${displayBN(beanOutput)}
      ${
        beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'
      } with ${props.weather.toFixed()}% Weather`);
  }

  details.push(
    `Receive ${displayBN(toPodValue)} Pods at #${displayBN(
      props.unripenedPods
    )} in the Pod line`
  );

  const noSoilTextField = props.soil.isEqualTo(0) ? (
    <Box style={{ marginTop: '-2px', fontFamily: 'Futura-PT-Book' }}>
      Currently No Soil
    </Box>
  ) : null;
  const frontrunTextField =
    props.settings.mode !== SwapMode.Bean &&
    props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD) ? (
      <FrontrunText />
    ) : null;
  const showSettings = (
    <SettingsFormModule
      settings={props.settings}
      setSettings={props.setSettings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={props.hasClaimable}
      hasSlippage
    />
  );
  function transactionDetails() {
    if (toPodValue.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        {toPodField}
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPodValue.isLessThanOrEqualTo(0)) return;

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
          loading: `Buying ${toBuyBeanValue} Beans and sowing for ${displayBN(toPodValue)} Pods`,
          success: `Sowed ${toBuyBeanValue} Beans for ${displayBN(toPodValue)} Pods`,
        });

        // Execute
        buyAndSowBeans(
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
          loading: `Sowing ${fromBeanValue} Beans`,
          success: `Sowed ${fromBeanValue} Beans`,
        });

        // Execute
        sowBeans(
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
      {noSoilTextField}
      {frontrunTextField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});
