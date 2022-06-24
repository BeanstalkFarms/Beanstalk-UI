import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { unstable_batchedUpdates } from 'react-dom'; // eslint-disable-line
import { AppState } from 'state';
import { Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  TransactionDetailsModule,
  TransactionTextModule,
  marketStrings,
  TokenOutputField,
} from 'components/Common';
import TransactionToast from 'components/Common/TransactionToast';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  buyRangeWarning: {
    color: 'red',
    fontSize: 'calc(9px + 0.5vmin)'
  },
  cancelOrderBox: {
    display: 'inline-block',
    width: '100%',
    fontSize: 'calc(9px + 0.5vmin)',
  },
  canCancelOrder: {
    fontSize: 'calc(9px + 0.5vmin)'
  },
  expandMoreIcon: {
    marginBottom: '-14px',
    width: '100%'
  }
});

type CreateOrderModuleProps = {
  isFormDisabled: boolean;
  setIsFormDisabled: Function;
  settings: any; // FIXME
  // setSettings: Function;
  poolForLPRatio: any; // FIXME
  updateExpectedPrice: any; // FIXME
}

export const CreateOrderModule = forwardRef((props: CreateOrderModuleProps, ref) => {
  const classes = useStyles();
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

  // Figure out how many Beans + ETH we need to purchase a given
  // number of Pods at the user's selected price.
  /* function calculateBeansAndEthForPodAmount(amount: BigNumber, price: BigNumber) {
    if (price.isGreaterThan(1) || price.isLessThanOrEqualTo(0)) {
      setToPodValue(new BigNumber(0));
    } else {
      // The number of Beans that must be locked
      // in the Marktplatz to buy `amount` Pods
      // at `price`.
      const beansNeeded = amount.times(price);

      // The number of beans we would need to buy
      // in order to create this Order.
      // NOTE: we may not be able to buy this many beans.
      const buyBeans = MaxBN(
        beansNeeded.minus(beanBalance),
        new BigNumber(0)
      );

      // Calculate the amount of ETH needed
      // to buy `buyBeans`.
      const ethNeeded = getToAmount(
        buyBeans,
        beanReserve,
        ethReserve,
      );

      // Calculate amount of ETH we can use.
      // Capped by the amount in user's balance.
      const ethToUse = MinBN(
        ethNeeded,
        ethBalance
      )

      // Calculate amount of Beans we can use.
      // Capped by the amount in user's balance.
      const beansToUse = MinBN(
        beansNeeded,
        beanBalance
      );

      // console.log({
      //   amount: amount.toNumber(),
      //   price: price.toNumber(),
      //   beansNeeded: beansNeeded.toNumber(),
      //   beanBalance: beanBalance.toNumber(),
      //   buyBeans: buyBeans.toNumber(),
      //   ethNeeded: ethNeeded.toNumber(),
      //   ethBalance: ethBalance.toNumber(),
      // });

      // // Change swap mode as necessary.
      // if (buyBeans.gt(0)) {
      //   if (beanBalance.gt(0)) {
      //     // Needs to buy beans but also has beans.
      //     props.setSettings({
      //       ...props.settings,
      //       mode: SwapMode.BeanEthereum
      //     })
      //   } else {
      //     // Needs to buy beans and has no beans.
      //     props.setSettings({
      //       ...props.settings,
      //       mode: SwapMode.Ethereum
      //     })
      //   }
      // } else {
      //   // Doesn't need to buy beans.
      //   props.setSettings({
      //     ...props.settings,
      //     mode: SwapMode.Bean
      //   })
      // }

      setToPodValue(amount);
      setToBuyBeanValue(TrimBN(
        buyBeans,
        BEAN.decimals
      ));
      setFromBeanValue(TrimBN(
        beansToUse,
        BEAN.decimals
      ));
      setFromEthValue(TrimBN(
        ethToUse,
        ETH.decimals
      ));
    }
  } */

  function calculatePods(buyNumber: BigNumber, price: BigNumber) {
    let podNumber = new BigNumber(0);
    if (price.isGreaterThan(1) || price.isLessThanOrEqualTo(0)) {
      setToPodValue(new BigNumber(0));
    } else {
      setToPodValue(buyNumber.dividedBy(price));
      podNumber = (buyNumber.dividedBy(price));
    }
    return podNumber;
  }

  function fromValueUpdated(newFromBeanNumber: BigNumber, newFromEthNumber: BigNumber) {
    // How many beans we'll get from buying with `newFromEthNumber` ETH.
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

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleMaxPlaceInLineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      balance={totalPods}
      label="Place in Pod Line"
      description={marketStrings.placeInPodLine}
      handleChange={handleMaxPlaceInLineChange}
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
      label="Price per pod"
      description={marketStrings.pricePerPod}
      token={CryptoAsset.Bean}
      handleChange={handlePriceChange}
      placeholder="0.50"
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const fromBeanField = (
    <InputFieldPlus
      balance={beanBalance}
      claimableBalance={beanClaimableBalance}
      beanLPClaimableBalance={props.poolForLPRatio(lpReceivableBalance)[0]}
      token={CryptoAsset.Bean}
      handleChange={(v: BigNumber) => fromValueUpdated(v, fromEthValue)}
      claim={props.settings.claim}
      visible={props.settings.mode !== SwapMode.Ethereum} // should be visible if mode = Bean | BeanEthereum
      value={TrimBN(fromBeanValue, 6)}
    />
  );
  const fromEthField = (
    <EthInputField
      balance={ethBalance}
      buyBeans={toBuyBeanValue}
      sellEth={fromEthValue}
      claimableBalance={claimableEthBalance}
      handleChange={(v: BigNumber) => fromValueUpdated(fromBeanValue, v)}
      mode={props.settings.mode} // will auto-disable if mode == SwapMode.Bean
      visible={props.settings.mode !== SwapMode.Bean} // should be visible if mode = Etherum | BeanEthereum
      claim={props.settings.claim}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  );

  /* Output Fields */
  // const lockedBeansField = (
  //   <TokenOutputField
  //     key={4}
  //     title="Beans Locked in Market"
  //     label="Beans Locked"
  //     token={CryptoAsset.Bean}
  //     value={TrimBN(MaxBN(
  //       toBuyBeanValue.plus(fromBeanValue),
  //       new BigNumber(0),
  //     ), 6)}
  //   />
  // );
  const toPodField = (
    <TokenOutputField
      title="Pods Received"
      description={marketStrings.podsReceived}
      token={FarmAsset.Pods}
      value={TrimBN(toPodValue, 6)}
    />
  );
  // const toPodField = (
  //   <TokenInputField
  //     label="Pods Received"
  //     description={marketStrings.podsReceived}
  //     placeholder={pricePerPodValue.lte(0) ? 'Choose price first' : undefined}
  //     locked={pricePerPodValue.lte(0)}
  //     token={FarmAsset.Pods}
  //     value={TrimBN(toPodValue, 6)}
  //     handleChange={(event: React.ChangeEvent<HTMLInputElement>) =>
  //       calculateBeansAndEthForPodAmount(
  //         new BigNumber(event.target.value || 0),
  //         pricePerPodValue
  //       )
  //     }
  //     style={{
  //       marginTop: 20,
  //     }}
  //     inputClassname={pricePerPodValue.lte(0) ? classes.toPodsInput : null}
  //   />
  // );

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
        <span className={classes.buyRangeWarning}>
          {marketStrings.buyRangeWarning}
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
      // showUnitModule={false}
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
        <TransactionDetailsModule fields={details} />
        <Box
          className={classes.cancelOrderBox}
        >
          <span className={classes.canCancelOrder}>
            {marketStrings.canCancelOrder}
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
      <ExpandMoreIcon
        color="primary"
        className={classes.expandMoreIcon}
      />
      {toPodField}
      {transactionDetails()}
      {rangeWarning}
      {frontrunTextField}
      {showSettings}
    </>
  );
});
