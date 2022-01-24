import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { unstable_batchedUpdates } from 'react-dom'; // eslint-disable-line
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import {
  BEAN,
  BEAN_TO_SEEDS,
  BEAN_TO_STALK,
  ETH,
  LPBEANS_TO_SEEDS,
  MIN_BALANCE,
  SEEDS,
  SLIPPAGE_THRESHOLD,
  STALK,
  UNI_V2_ETH_BEAN_LP,
} from 'constants/index';
import {
  addAndDepositLP,
  convertAddAndDepositLP,
  depositLP,
  displayBN,
  getBuyAndAddLPAmount,
  getFromAmount,
  lpForPool,
  MaxBN,
  MinBN,
  smallDecimalPercent,
  SwapMode,
  tokenForLP,
  TokenLabel,
  toStringBaseUnitBN,
  toTokenUnitsBN,
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

export const LPDepositModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(0));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(0));
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(0));
  const [toSellBeanValue, setToSellBeanValue] = useState(new BigNumber(0));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [toSellEthValue, setToSellEthValue] = useState(new BigNumber(0));
  const [toBuyEthValue, setToBuyEthValue] = useState(new BigNumber(0));
  const [toSiloLPValue, setToSiloLPValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [beanConvertParams, setBeanConvertParams] = useState({
    crates: [],
    amounts: [],
  });

  function fromValueUpdated(newFromNumber, newFromEthNumber, newFromLPNumber) {
    if (
      newFromNumber.isLessThanOrEqualTo(0) &&
      newFromEthNumber.isLessThanOrEqualTo(0) &&
      newFromLPNumber.isLessThan(0)
    ) {
      // eslint-disable-next-line
      unstable_batchedUpdates(() => {
        setFromBeanValue(new BigNumber(-1));
        setFromEthValue(new BigNumber(-1));
        setFromLPValue(new BigNumber(-1));
        setToBuyBeanValue(new BigNumber(0));
        setToBuyEthValue(new BigNumber(0));
        setToSellBeanValue(new BigNumber(0));
        setToSellEthValue(new BigNumber(0));
        setToSiloLPValue(new BigNumber(0));
        setToStalkValue(new BigNumber(0));
        setToSeedsValue(new BigNumber(0));
      });
      props.setIsFormDisabled(true);
      return;
    }
    let fromNumber = new BigNumber(0);
    let fromEtherNumber = new BigNumber(0);
    const fromLPNumber = MaxBN(newFromLPNumber, new BigNumber(0));
    let buyNumber = new BigNumber(0);
    let sellNumber = new BigNumber(0);
    let fromConvertBeans = new BigNumber(0);
    let newBeanReserve = props.beanReserve;
    let newEthReserve = props.ethReserve;

    const handleConvertCrates = (beans) => {
      let beansRemoved = new BigNumber(0);
      let stalkRemoved = new BigNumber(0);
      const crates = [];
      const amounts = [];
      Object.keys(props.beanCrates)
        .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
        .some((key) => {
          const crateBeansRemoved = beansRemoved
            .plus(props.beanCrates[key])
            .isLessThanOrEqualTo(beans)
            ? props.beanCrates[key]
            : beans.minus(beansRemoved);
          beansRemoved = beansRemoved.plus(crateBeansRemoved);
          stalkRemoved = stalkRemoved.plus(
            crateBeansRemoved
              .multipliedBy(props.season.minus(key))
              .multipliedBy(BEAN_TO_SEEDS)
          );
          crates.push(key);
          amounts.push(toStringBaseUnitBN(crateBeansRemoved, BEAN.decimals));
          return beansRemoved.isEqualTo(beans);
        });
      setBeanConvertParams({ crates, amounts });
      return [toTokenUnitsBN(stalkRemoved, 4), beansRemoved];
    };

    if (
      props.settings.mode === SwapMode.BeanEthereum ||
      props.settings.mode === SwapMode.BeanEthereumSwap
    ) {
      const newBeanFromEthNumber = newFromEthNumber.isGreaterThan(0)
        ? newFromEthNumber.multipliedBy(props.ethToBean).plus(0.000001)
        : new BigNumber(0);
      fromNumber = MinBN(newFromNumber, newBeanFromEthNumber);
      if (props.settings.convert) {
        fromConvertBeans = handleConvertCrates(fromNumber)[1];
      }
      fromEtherNumber = fromNumber.multipliedBy(props.beanToEth);
      newFromEthNumber = newFromEthNumber.minus(fromEtherNumber);
      if (props.settings.mode === SwapMode.BeanEthereum) {
        setFromBeanValue(
          MaxBN(TrimBN(fromNumber, BEAN.decimals), new BigNumber(0))
        );
        setFromEthValue(TrimBN(fromEtherNumber, ETH.decimals));
      }
    }
    if (
      props.settings.mode === SwapMode.Ethereum ||
      (props.settings.mode === SwapMode.BeanEthereumSwap &&
        fromNumber.isEqualTo(newFromNumber))
    ) {
      buyNumber = getBuyAndAddLPAmount(
        MaxBN(newFromEthNumber.minus(fromEtherNumber), new BigNumber(0)),
        props.ethReserve,
        props.beanReserve
      );
      sellNumber = getFromAmount(
        MaxBN(buyNumber, new BigNumber(0)),
        props.ethReserve,
        props.beanReserve,
        ETH.decimals
      );
      fromEtherNumber = newFromEthNumber;
      setToBuyBeanValue(buyNumber);
      setToSellEthValue(sellNumber);
      setFromEthValue(
        MaxBN(TrimBN(fromEtherNumber, ETH.decimals), new BigNumber(0))
      );
      setFromBeanValue(fromNumber);
      fromEtherNumber = newFromEthNumber.minus(sellNumber);
      fromNumber = fromNumber.plus(buyNumber);
      newEthReserve = newEthReserve.plus(sellNumber);
      newBeanReserve = newBeanReserve.minus(buyNumber);
    } else if (
      props.settings.mode === SwapMode.Bean ||
      (props.settings.mode === SwapMode.BeanEthereumSwap &&
        fromNumber.isLessThan(newFromNumber))
    ) {
      buyNumber = getBuyAndAddLPAmount(
        MaxBN(newFromNumber.minus(fromNumber), new BigNumber(0)),
        props.beanReserve,
        props.ethReserve
      );
      sellNumber = getFromAmount(
        buyNumber,
        props.beanReserve,
        props.ethReserve
      );
      fromNumber = MaxBN(newFromNumber, new BigNumber(0));
      setToBuyEthValue(buyNumber);
      setToSellBeanValue(sellNumber);
      setFromEthValue(fromEtherNumber);
      setFromBeanValue(TrimBN(fromNumber, BEAN.decimals));
      fromNumber = fromNumber.minus(sellNumber);
      fromEtherNumber = fromEtherNumber.plus(buyNumber);
      newBeanReserve = newBeanReserve.plus(sellNumber);
      newEthReserve = newEthReserve.minus(buyNumber);
    }
    setFromLPValue(fromLPNumber);
    const lpToDeposit = fromLPNumber.plus(
      lpForPool(
        MaxBN(fromNumber, new BigNumber(0)),
        newBeanReserve,
        MaxBN(fromEtherNumber, new BigNumber(0)),
        newEthReserve,
        props.totalLP
      )
    );
    fromNumber = MaxBN(fromNumber, new BigNumber(0)).plus(
      tokenForLP(fromLPNumber, newBeanReserve, props.totalLP)
    );
    setToSiloLPValue(lpToDeposit, UNI_V2_ETH_BEAN_LP.decimals);
    setToStalkValue(
      TrimBN(
        fromNumber
          .multipliedBy(props.beanToStalk)
          .minus(fromConvertBeans.multipliedBy(BEAN_TO_STALK)),
        STALK.decimals
      )
    );
    setToSeedsValue(
      TrimBN(
        fromNumber
          .multipliedBy(2 * LPBEANS_TO_SEEDS)
          .minus(fromConvertBeans.multipliedBy(BEAN_TO_SEEDS)),
        SEEDS.decimals
      )
    );
    props.setIsFormDisabled(
      fromNumber.isLessThanOrEqualTo(0) &&
        fromEtherNumber.isLessThanOrEqualTo(0) &&
        fromLPNumber.isLessThanOrEqualTo(0)
    );
  }

  const convertibleBeans =
    props.settings.convert && props.settings.mode === SwapMode.BeanEthereum
      ? props.maxFromBeanSiloVal
      : new BigNumber(0);
  const claimableBeans = props.settings.claim
    ? props.beanClaimableBalance
    : new BigNumber(0);
  const maxBeans = props.beanBalance
    .plus(convertibleBeans)
    .plus(claimableBeans);

  /* Input Fields */

  const fromBeanField = (
    <InputFieldPlus
      balance={props.beanBalance.plus(convertibleBeans)}
      buyEth={toBuyEthValue}
      claim={props.settings.claim}
      claimableBalance={props.beanClaimableBalance}
      beanLPClaimableBalance={props.beanLPClaimableBalance}
      handleChange={(v) =>
        fromValueUpdated(
          v,
          props.ethBalance.isGreaterThan(MIN_BALANCE)
            ? props.ethBalance.minus(MIN_BALANCE)
            : new BigNumber(0),
          fromLPValue
        )
      }
      sellToken={toSellBeanValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromBeanValue, BEAN.decimals)}
      visible={props.settings.mode < 2}
    />
  );
  const fromLPField = (
    <InputFieldPlus
      balance={props.lpBalance}
      claim={props.settings.claim}
      claimableBalance={new BigNumber(0)}
      handleChange={(v) => fromValueUpdated(fromBeanValue, fromEthValue, v)}
      isLP
      poolForLPRatio={props.poolForLPRatio}
      token={CryptoAsset.LP}
      value={TrimBN(fromLPValue, UNI_V2_ETH_BEAN_LP.decimals)}
      visible={props.settings.useLP || props.settings.mode === SwapMode.LP}
    />
  );
  const fromEthField = (
    <EthInputField
      balance={props.ethBalance}
      buyBeans={toBuyBeanValue}
      claim={props.settings.claim}
      claimableBalance={props.claimableEthBalance}
      handleChange={(v) => fromValueUpdated(maxBeans, v, fromLPValue)}
      mode={props.settings.mode}
      sellEth={toSellEthValue}
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
  const toSiloLPField = (
    <TokenOutputField mint token={SiloAsset.LP} value={toSiloLPValue} />
  );

  /* Transaction Details, settings and text */

  function displayLP(beanInput, ethInput) {
    return `${displayBN(beanInput)}
      ${beanInput.isEqualTo(1) ? 'Bean' : 'Beans'} and ${displayBN(ethInput)}
      ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

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

  // Eth Mode transaction details

  if (
    (props.settings.mode === SwapMode.Ethereum ||
      (props.settings.mode === SwapMode.BeanEthereumSwap &&
        toBuyBeanValue.isGreaterThan(0))) &&
    fromEthValue.isGreaterThan(0)
  ) {
    details.push(
      <TransactionTextModule
        key="buy"
        balance={toBuyBeanValue}
        buyBeans={toBuyBeanValue}
        claim={props.settings.claim}
        claimableBalance={props.claimableEthBalance}
        mode={props.settings.mode}
        sellEth={toSellEthValue}
        updateExpectedPrice={props.updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
    details.push(
      `Add ${displayLP(
        MaxBN(fromBeanValue, new BigNumber(0)).plus(
          MaxBN(toBuyBeanValue, new BigNumber(0))
        ),
        MaxBN(fromEthValue, new BigNumber(0)).minus(
          MaxBN(toSellEthValue, new BigNumber(0))
        )
      )} to the BEAN:ETH pool`
    );
    details.push(
      `Receive ${displayBN(
        new BigNumber(toSiloLPValue.minus(MaxBN(fromLPValue, new BigNumber(0))))
      )} LP Tokens`
    );
  }

  // Bean Mode transaction details

  if (
    (props.settings.mode === SwapMode.Bean ||
      (props.settings.mode === SwapMode.BeanEthereumSwap &&
        toBuyEthValue.isGreaterThan(0))) &&
    fromBeanValue.isGreaterThan(0)
  ) {
    details.push(
      <TransactionTextModule
        balance={props.beanBalance.plus(convertibleBeans)}
        buyEth={toBuyEthValue}
        claim={props.settings.claim}
        claimableBalance={props.beanClaimableBalance}
        mode={props.settings.mode}
        sellToken={toSellBeanValue}
        updateExpectedPrice={props.updateExpectedPrice}
        value={TrimBN(fromBeanValue, BEAN.decimals)}
      />
    );
    details.push(
      `Add ${displayLP(
        MaxBN(fromBeanValue, new BigNumber(0)).minus(
          MaxBN(toSellBeanValue, new BigNumber(0))
        ),
        MaxBN(fromEthValue, toBuyEthValue)
      )} to the BEAN:ETH pool`
    );
    details.push(
      `Receive ${displayBN(
        new BigNumber(toSiloLPValue.minus(MaxBN(fromLPValue, new BigNumber(0))))
      )} LP Tokens`
    );
  }

  // Circulating LP Mode transaction details

  if (props.settings.mode === SwapMode.LP) {
    // placeholder for review - do not need it right now
  }

  // Bean + Eth Mode transaction details

  if (
    props.settings.mode === SwapMode.BeanEthereum &&
    fromEthValue.isGreaterThan(0)
  ) {
    details.push(
      `Add ${displayLP(
        MaxBN(fromBeanValue, new BigNumber(0)),
        MaxBN(fromEthValue, new BigNumber(0))
      )} to the BEAN:ETH pool`
    );
    details.push(
      `Receive ${displayBN(
        new BigNumber(toSiloLPValue.minus(MaxBN(fromLPValue, new BigNumber(0))))
      )} LP Tokens`
    );
  }

  details.push(
    `Deposit ${displayBN(
      new BigNumber(toSiloLPValue).plus(MinBN(fromLPValue, new BigNumber(0)))
    )} LP Tokens in the Silo`
  );
  details.push(
    `Receive ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(
      new BigNumber(toSeedsValue)
    )} Seeds`
  );

  const resetFields = () => {
    fromValueUpdated(new BigNumber(-1), new BigNumber(-1), new BigNumber(-1));
  };
  const frontrunTextField =
    props.settings.mode !== SwapMode.Bean &&
    props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD) ? (
      <FrontrunText />
    ) : null;
  const showSettings = (
    <SettingsFormModule
      handleMode={resetFields}
      hasClaimable={props.hasClaimable}
      hasConvertible={props.maxFromBeanSiloVal.isGreaterThan(0)}
      hasSlippage
      setSettings={props.setSettings}
      settings={props.settings}
      showLP={props.lpBalance.isGreaterThan(0)}
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
          {toSiloLPField}
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
      if (
        fromBeanValue.isGreaterThan(0) ||
        fromEthValue.isGreaterThan(0) ||
        fromLPValue.isGreaterThan(0)
      ) {
        const claimable = props.settings.claim ? props.claimable : null;
        const lp = MaxBN(fromLPValue, new BigNumber(0));
        if (props.settings.mode === SwapMode.LP && lp.isGreaterThan(0)) {
          // Toast
          const txToast = new TransactionToast({
            loading: `Depositing ${displayBN(toSiloLPValue)} LP`,
            success: `Deposited ${displayBN(toSiloLPValue)} LP`,
          });

          // Execute
          depositLP(
            toStringBaseUnitBN(lp, ETH.decimals),
            claimable,
            (response) => {
              resetFields();
              txToast.confirming(response);
            }
          )
          .then((value) => {
            txToast.success(value);
          })
          .catch((err) => {
            txToast.error(err);
          });
        } else if (props.settings.convert) {
          // Toast
          const txToast = new TransactionToast({
            loading: `Converting and depositing ${displayBN(toSiloLPValue)} LP`,
            success: `Converted and deposited ${displayBN(toSiloLPValue)} LP`,
          });

          // Execute
          convertAddAndDepositLP(
            toStringBaseUnitBN(lp, ETH.decimals),
            toStringBaseUnitBN(fromEthValue, ETH.decimals),
            [
              toStringBaseUnitBN(fromBeanValue, BEAN.decimals),
              toStringBaseUnitBN(
                fromBeanValue.multipliedBy(props.settings.slippage),
                BEAN.decimals
              ),
              toStringBaseUnitBN(
                fromEthValue.multipliedBy(props.settings.slippage),
                ETH.decimals
              ),
            ],
            beanConvertParams.crates,
            beanConvertParams.amounts,
            claimable,
            (response) => {
              resetFields();
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
          // Contract inputs
          const beans = fromBeanValue
            .plus(toBuyBeanValue)
            .minus(toSellBeanValue);
          const buyEth = MaxBN(toBuyEthValue, new BigNumber(0));
          const eth = fromEthValue.plus(buyEth).minus(toSellEthValue);

          // Toast
          const txToast = new TransactionToast({
            loading: `Adding and depositing ${displayBN(toSiloLPValue)} LP`,
            success: `Added and deposited ${displayBN(toSiloLPValue)} LP`,
          });

          // Execute
          addAndDepositLP(
            toStringBaseUnitBN(lp, ETH.decimals),
            toStringBaseUnitBN(toBuyBeanValue, BEAN.decimals),
            toStringBaseUnitBN(buyEth, ETH.decimals),
            toStringBaseUnitBN(fromEthValue, ETH.decimals),
            [
              toStringBaseUnitBN(beans, BEAN.decimals),
              toStringBaseUnitBN(
                beans.multipliedBy(props.settings.slippage),
                BEAN.decimals
              ),
              toStringBaseUnitBN(
                eth.multipliedBy(props.settings.slippage),
                ETH.decimals
              ),
            ],
            claimable,
            (response) => {
              resetFields();
              txToast.confirming(response);
            }
          )
          .then((value) => {
            txToast.success(value);
          })
          .catch((err) => {
            console.error(err);
            txToast.error(err);
          });
        }
      }
    },
  }));

  return (
    <>
      {fromLPField}
      {fromBeanField}
      {fromEthField}
      {transactionDetails()}
      {frontrunTextField}
      {showSettings}
    </>
  );
});
