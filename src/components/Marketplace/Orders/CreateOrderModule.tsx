import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { unstable_batchedUpdates } from 'react-dom'; // eslint-disable-line
import { AppState } from 'state';
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  BEAN,
  ETH,
  SLIPPAGE_THRESHOLD,
} from 'constants/index';
import {
  displayBN,
  getToAmount,
  MaxBN,
  SwapMode,
  TrimBN,
  toBaseUnitBN,
  toStringBaseUnitBN,
  buyBeansAndCreatePodOrder,
  createPodOrder,
} from 'util/index';
import {
  ClaimTextModule,
  CryptoAsset,
  EthInputField,
  FarmAsset,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionTextModule,
  marketStrings,
} from 'components/Common';
import TransactionToast from 'components/Common/TransactionToast';

type CreateOrderModuleProps = {
  isFormDisabled: boolean;
  setIsFormDisabled: Function;
  settings: any; // FIXME
  setSettings: Function;
  poolForLPRatio: any; // FIXME
  updateExpectedPrice: any; // FIXME
}

export const CreateOrderModule = forwardRef((props: CreateOrderModuleProps, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [maxPlaceInLineValue, setMaxPlaceInLineValue] = useState(new BigNumber(0));
  const [toPodValue, setToPodValue] = useState(new BigNumber(0));

  const {
    beanBalance,
    beanClaimableBalance,
    claimable,
    claimableEthBalance,
    lpReceivableBalance,
    ethBalance,
    hasClaimable,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { beanReserve, ethReserve } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );
  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  // const { listings } = useSelector<AppState, AppState['marketplace']>(
  //   (state) => state.marketplace,
  // );

  // Disable form when params are not properly established.
  useEffect(() => {
    const isDisabled = () => {
      if (
        !maxPlaceInLineValue.isGreaterThan(0) ||
        toPodValue.isLessThanOrEqualTo(0) ||
        maxPlaceInLineValue.isLessThan(toPodValue)
      ) {
        props.setIsFormDisabled(true);
      } else {
        props.setIsFormDisabled(false);
      }
    };

    isDisabled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    maxPlaceInLineValue,
    toPodValue,
    props.isFormDisabled,
  ]);

  //
  function calculatePods(buyNumber, price) {
    let podNumber = new BigNumber(0);
    if (price.isGreaterThan(1) || price.isLessThanOrEqualTo(0)) {
      setToPodValue(new BigNumber(0));
    } else {
      setToPodValue(buyNumber.dividedBy(price));
      podNumber = (buyNumber.dividedBy(price));
    }
    return podNumber;
  }

  /**  */
  function fromValueUpdated(newFromBeanNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      ethReserve,
      beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals));
    setFromBeanValue(TrimBN(newFromBeanNumber, BEAN.decimals));
    calculatePods(
      buyBeans.plus(MaxBN(newFromBeanNumber, new BigNumber(0))),
      pricePerPodValue
    );
  }

  const handlePriceChange = (event) => {
    let newPricePerPodValue = event.target.value !== ''
      ? new BigNumber(event.target.value)
      : new BigNumber(0);

    if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
      newPricePerPodValue = new BigNumber(1);
    }

    setPricePerPodValue(newPricePerPodValue);
    calculatePods(
      toBuyBeanValue.plus(MaxBN(fromBeanValue, new BigNumber(0))),
      newPricePerPodValue
    );
  };

  // TODO: needs to be optimized for more efficient rerendering
  const handleInputChange = (event) => {
    const newMaxPlaceInLineValue = event.target.value !== ''
      ? new BigNumber(event.target.value)
      : new BigNumber(0);

    if (
      newMaxPlaceInLineValue.isGreaterThanOrEqualTo(totalPods) ||
      toPodValue.isGreaterThanOrEqualTo(totalPods)
    ) {
      setMaxPlaceInLineValue(totalPods);
      return;
    }
    setMaxPlaceInLineValue(newMaxPlaceInLineValue);
  };

  /* Input Fields */
  const maxPlaceInLineField = (
    <TokenInputField
      key={3}
      balance={totalPods}
      label="Place in Pod Line"
      description={marketStrings.placeInPodLine}
      handleChange={handleInputChange}
      placeholder={totalPods.toFixed()}
      value={TrimBN(maxPlaceInLineValue, 6)}
      error={maxPlaceInLineValue.isLessThan(toPodValue)}
      // Enable sliders
      range
      handleSlider={(event) => {
        setMaxPlaceInLineValue(new BigNumber(event));
      }}
    />
  );

  // TODO: Make field outlined red when user inputs price (given range) that is lower than the average of the marketplace average price
  const pricePerPodField = (
    <TokenInputField
      key={2}
      label="Price per pod"
      token={CryptoAsset.Bean}
      handleChange={handlePriceChange}
      placeholder="0.50"
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const fromBeanField = (
    <InputFieldPlus
      key={0}
      balance={beanBalance}
      claimableBalance={beanClaimableBalance}
      beanLPClaimableBalance={props.poolForLPRatio(lpReceivableBalance)[0]}
      token={CryptoAsset.Bean}
      handleChange={(event) => fromValueUpdated(event, fromEthValue)}
      claim={props.settings.claim}
      visible={props.settings.mode !== SwapMode.Ethereum} // should be visible if mode = Bean | BeanEthereum
      value={TrimBN(fromBeanValue, 6)}
    />
  );
  const fromEthField = (
    <EthInputField
      key={1}
      balance={ethBalance}
      buyBeans={toBuyBeanValue}
      sellEth={fromEthValue}
      claimableBalance={claimableEthBalance}
      handleChange={(event) => fromValueUpdated(fromBeanValue, event)}
      mode={props.settings.mode} // will auto-disable if mode == SwapMode.Bean
      claim={props.settings.claim}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  );

  /* Output Fields */
  const toPodField = (
    <TokenOutputField
      key={4}
      label="Price per pod"
      token={FarmAsset.Pods}
      value={TrimBN(toPodValue, 6)}
    />
  );

  /* Transaction Details, settings and text */
  const beanClaimable = MaxBN(
    props.poolForLPRatio(lpReceivableBalance)[0], new BigNumber(0)
  ).plus(beanClaimableBalance);
  const ethClaimable = MaxBN(
    props.poolForLPRatio(lpReceivableBalance)[1], new BigNumber(0)
  ).plus(claimableEthBalance);

  const details = [];
  if (props.settings.claim) {
    details.push(
      <ClaimTextModule
        key="claim"
        claim={props.settings.claim}
        beanClaimable={beanClaimable}
        ethClaimable={ethClaimable}
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
        claimableBalance={ethClaimable}
        mode={props.settings.mode}
        sellEth={fromEthValue}
        updateExpectedPrice={props.updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
  }
  details.push(
    `Place an Order for ${displayBN(toPodValue)} Pods anywhere before ${displayBN(maxPlaceInLineValue)} in the Pod Line at a price of
    ${pricePerPodValue.toFixed(2)} Beans per Pod`
  );
  details.push(
    `${displayBN(toBuyBeanValue.plus(MaxBN(fromBeanValue, new BigNumber(0))))} Beans
    will be locked in the Pod Order to allow for instant settlement`
  );

  const rangeWarning = maxPlaceInLineValue.isLessThan(toPodValue)
    ? (
      <>
        <span style={{ color: 'red', fontSize: 'calc(9px + 0.5vmin)' }}>
          WARNING: The Buy Range is too small to make an Order or there aren&apos;t enough availble Pods in the market.
        </span>
        <br />
      </>
      )
    : null;
  const frontrunTextField =
    props.settings.mode !== SwapMode.Bean &&
    props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD) ? (
      <FrontrunText />
    ) : null;
  const showSettings = (
    <SettingsFormModule
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={hasClaimable}
      hasSlippage
      setSettings={props.setSettings}
      settings={props.settings}
    />
  );

  const resetFields = () => {
    // eslint-disable-next-line
    unstable_batchedUpdates(() => {
      fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
      setPricePerPodValue(new BigNumber(-1));
      setMaxPlaceInLineValue(new BigNumber(-1));
      setToPodValue(new BigNumber(-1));
    });
  };

  function transactionDetails() {
    if (props.isFormDisabled) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        {toPodField}
        <TransactionDetailsModule fields={details} />
        <Box
          style={{
            display: 'inline-block',
            width: '100%',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          <span style={{ fontSize: 'calc(9px + 0.5vmin)' }}>
            You can cancel the order to return the locked Beans from the marketplace
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPodValue.isLessThanOrEqualTo(0)) return;
      const _claimable = props.settings.claim ? claimable : null;

      // Check for an existing listing to sell into. We want to find the listing that is:
      //    1. As close as possible to the front of the line.
      //    2. Has a price <= pricePerPodValue (ideally minimized)
      //
      // What there is no one Listing below `pricePerPod` that could
      // fill all of `amount` requested in this Order?
      //
      // Consider: I want to buy 100 Pods at 0.50 Bean/Pod (implied 50 Bean spend). There are
      // two available listings:
      //    a) 100 Pods at 0.40 Bean/Pod
      //    b) 10 Pods at 0.20 Bean/Pod
      //
      // Options:
      //    1. Suggest the best 1 listing with the best combination of `pricePerPod` and
      //       `amount` that is available.
      //          - I can buy all of Listing A immediately for (100 Pods)*0.40=40 Beans.
      //            My Order is filled.
      //          - I can buy all of Listing B immediately for (10 Pods)*0.2=2 Beans.
      //            My Order is NOT filled. I would need to re-issue and receive a new
      //            prompt to Buy (presumably from Listing A since Listing B is exhausted).
      //
      //    2. Suggest the best N listings under `pricePerPod` until the user receives
      //       the total number of Pods requested in the Order. This likely means
      //       buying from at least 1 partial listing.
      //          - I buy all of Listing B immediately for (10 Pods)*0.20=2 Beans. This
      //            executes first because we want to lock in the lower price.
      //          - I now need (100 Pods - 10 Pods) = 90 Pods, which are purchased from
      //            Listing A) for (90 Pods)*0.4 = 36 Beans. Total price 38 Beans.
      //          - Note that this would need to be executed in two separate transactions.
      //
      // 1/27/2022: going to pause here to move on to other market tasks, but will circle back. -SC

      //
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
          loading: `Placing an order to buy ${displayBN(toPodValue)} Pods`,
          success: 'Order placed!',
        });

        // Execute
        buyBeansAndCreatePodOrder({
          beanAmount: beans,
          buyBeanAmount: buyBeans,
          pricePerPod: toStringBaseUnitBN(pricePerPodValue, BEAN.decimals),
          maxPlaceInLine: toStringBaseUnitBN(maxPlaceInLineValue, BEAN.decimals),
          claimable: _claimable,
          ethAmount: eth,
        }, (response) => {
          resetFields();
          txToast.confirming(response);
        })
        .then((value) => {
          txToast.success(value);
        })
        .catch((err) => {
          txToast.error(err);
        });
      } else {
        // Toast
        const txToast = new TransactionToast({
          loading: `Placing an order to buy ${displayBN(toPodValue)} Pods`,
          success: 'Order placed!',
        });

        // Execute
        createPodOrder({
          beanAmount: toStringBaseUnitBN(fromBeanValue, BEAN.decimals),
          pricePerPod: toStringBaseUnitBN(pricePerPodValue, BEAN.decimals),
          maxPlaceInLine: toStringBaseUnitBN(maxPlaceInLineValue, BEAN.decimals),
          claimable: _claimable,
        }, (response) => {
          resetFields();
          txToast.confirming(response);
        })
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
      {maxPlaceInLineField}
      {pricePerPodField}
      {fromBeanField}
      {fromEthField}
      {transactionDetails()}
      {rangeWarning}
      {frontrunTextField}
      {showSettings}
    </>
  );
});
