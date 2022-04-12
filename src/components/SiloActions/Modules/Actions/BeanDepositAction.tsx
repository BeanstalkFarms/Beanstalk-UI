import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BEAN,
  BEAN_TO_SEEDS,
  BEAN_TO_STALK,
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
  TransactionToast,
} from 'components/Common';

const BeanDepositAction = forwardRef(({
  setIsFormDisabled,
  settings,
  setSettings,
  poolForLPRatio,
  updateExpectedPrice,
}, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));

  const {
    beanBalance,
    beanClaimableBalance,
    claimable,
    claimableEthBalance,
    ethBalance,
    hasClaimable,
    lpReceivableBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const {
    beanReserve,
    ethReserve,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const { totalStalk } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  function fromValueUpdated(newFromNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      ethReserve,
      beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals));
    setFromBeanValue(TrimBN(newFromNumber, BEAN.decimals));
    const depositedBeans = MaxBN(buyBeans, new BigNumber(0)).plus(
      MaxBN(newFromNumber, new BigNumber(0))
    );
    const newToStalkValue = TrimBN(
      depositedBeans.multipliedBy(BEAN_TO_STALK),
      STALK.decimals
    );
    setToStalkValue(newToStalkValue);
    setToSeedsValue(
      TrimBN(depositedBeans.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals)
    );
    setIsFormDisabled(newToStalkValue.isLessThanOrEqualTo(0));
  }

  // If you withdraw LP and you have `convertLP` on,
  // convert that LP to the underlying beans and eth,
  // you can reuse those in the same transaction
  // add claimLPBeans
  // claimable lp tokens that I withdrew; can use the beans
  // in the same contract
  const claimLPBeans = MaxBN(poolForLPRatio(lpReceivableBalance)[0], new BigNumber(0));
  const ethClaimable = claimableEthBalance.plus(
    MaxBN(poolForLPRatio(lpReceivableBalance)[1], new BigNumber(0))
  );

  /* Input Fields */
  const fromBeanField = (
    <InputFieldPlus
      key={0}
      balance={beanBalance}
      claim={settings.claim}
      claimableBalance={beanClaimableBalance}
      beanLPClaimableBalance={claimLPBeans}
      handleChange={(v) => {
        fromValueUpdated(v, fromEthValue);
      }}
      token={CryptoAsset.Bean}
      value={fromBeanValue}
      visible={settings.mode !== SwapMode.Ethereum}
    />
  );
  const fromEthField = (
    <EthInputField
      key={1}
      balance={ethBalance}
      buyBeans={toBuyBeanValue}
      claim={settings.claim}
      claimableBalance={ethClaimable}
      handleChange={(v) => {
        fromValueUpdated(fromBeanValue, v);
      }}
      mode={settings.mode}
      sellEth={fromEthValue}
      updateExpectedPrice={updateExpectedPrice}
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
  if (settings.claim) {
    details.push(
      <ClaimTextModule
        key="claim"
        claim={settings.claim}
        beanClaimable={beanClaimableBalance.plus(claimLPBeans)}
        ethClaimable={ethClaimable}
      />
    );
  }
  if (
    settings.mode === SwapMode.Ethereum ||
    (settings.mode === SwapMode.BeanEthereum &&
      toBuyBeanValue.isGreaterThan(0))
  ) {
    details.push(
      <TransactionTextModule
        key="buy"
        buyBeans={toBuyBeanValue}
        mode={settings.mode}
        sellEth={fromEthValue}
        updateExpectedPrice={updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
  }
  const beanOutput = MaxBN(toBuyBeanValue, new BigNumber(0)).plus(
    MaxBN(fromBeanValue, new BigNumber(0))
  );

  details.push(
    `Deposit ${displayBN(beanOutput)} ${beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'} in the Silo`,
    `Receive ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(new BigNumber(toSeedsValue))} Seeds`
  );

  const frontrunTextField =
    settings.mode !== SwapMode.Bean &&
    settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD) ? (
      <FrontrunText />
    ) : null;
  const showSettings = (
    <SettingsFormModule
      setSettings={setSettings}
      settings={settings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={hasClaimable}
      hasSlippage
    />
  );
  const stalkChangePercent = toStalkValue
    .dividedBy(totalStalk.plus(toStalkValue))
    .multipliedBy(100);

  function transactionDetails() {
    if (toStalkValue.isLessThanOrEqualTo(0)) return null;

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
      if (toStalkValue.isLessThanOrEqualTo(0)) return null;

      const _claimable = settings.claim ? claimable : null;
      if (fromEthValue.isGreaterThan(0)) {
        // Contract Inputs
        const beans = MaxBN(
          toBaseUnitBN(fromBeanValue, BEAN.decimals),
          new BigNumber(0)
        ).toString();
        const eth = toStringBaseUnitBN(fromEthValue, ETH.decimals);
        const buyBeans = toStringBaseUnitBN(
          toBuyBeanValue.multipliedBy(settings.slippage),
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
          _claimable,
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
          _claimable,
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

export default BeanDepositAction;
