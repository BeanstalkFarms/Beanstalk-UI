import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { BEAN, BEAN_TO_SEEDS, SEEDS, STALK } from 'constants/index';
import {
  claimAndWithdrawBeans,
  displayBN,
  MinBN,
  MinBNs,
  MaxBN,
  smallDecimalPercent,
  toStringBaseUnitBN,
  TrimBN,
  withdrawBeans,
} from 'util/index';
import {
  ClaimTextModule,
  SettingsFormModule,
  SiloAsset,
  siloStrings,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransitAsset,
  TransactionToast,
} from 'components/Common';

const BeanWithdrawAction = forwardRef(({
  setIsFormDisabled,
  settings,
  setSettings,
  poolForLPRatio,
  stalkToLP, /* empty */
  seedsToLP, /* empty */
}, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    beanDeposits,
    beanSiloBalance,
    beanClaimableBalance,
    claimable,
    claimableEthBalance,
    hasClaimable,
    lpReceivableBalance,
    seedBalance,
    stalkBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );
  const { totalStalk, withdrawSeasons } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  /* function maxBeans(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(beanDeposits).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerBean = (new BigNumber(10000)).plus(season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerBean.multipliedBy(beanDeposits[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerBean.multipliedBy(beanDeposits[key]))
        beans = beans.plus(beanDeposits[key])
        if (stalkRemoved.isEqualTo(stalk)) return
      } else {
        beans = beans.plus(TrimBN(stalkLeft.dividedBy(stalkPerBean),BEAN.decimals))
        return
      }
    })
    return beans
  }
  */

  const getStalkRemoved = (beans) => {
    let beansRemoved = new BigNumber(0);
    let stalkRemoved = new BigNumber(0);
    const crates = [];
    const amounts = [];
    Object.keys(beanDeposits)
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .some((key) => {
        const crateBeansRemoved = beansRemoved
          .plus(beanDeposits[key])
          .isLessThanOrEqualTo(beans)
          ? beanDeposits[key]
          : beans.minus(beansRemoved);
        beansRemoved = beansRemoved.plus(crateBeansRemoved);
        stalkRemoved = stalkRemoved.plus(crateBeansRemoved);
        stalkRemoved = stalkRemoved.plus(
          crateBeansRemoved
            .multipliedBy(season.minus(key))
            .multipliedBy(0.0002)
        );
        crates.push(key);
        amounts.push(toStringBaseUnitBN(crateBeansRemoved, BEAN.decimals));
        return beansRemoved.isEqualTo(beans);
      });
    setWithdrawParams({ crates, amounts });
    return stalkRemoved;
  };

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBN(newFromNumber, beanSiloBalance);
    const newFromBeanValue = TrimBN(fromNumber, BEAN.decimals);
    setFromBeanValue(newFromBeanValue);
    setToStalkValue(TrimBN(getStalkRemoved(fromNumber), STALK.decimals));
    setToSeedsValue(
      TrimBN(fromNumber.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals)
    );
    setIsFormDisabled(newFromBeanValue.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    const minMaxFromVal = MinBNs([
      stalkBalance.multipliedBy(stalkToLP),
      seedBalance.multipliedBy(seedsToLP),
      beanSiloBalance,
    ]);
    fromValueUpdated(minMaxFromVal);
  };

  /* Input Fields */
  const fromBeanField = (
    <TokenInputField
      balance={beanSiloBalance}
      claim={settings.claim}
      handleChange={handleFromChange}
      locked={beanSiloBalance.isLessThanOrEqualTo(0)}
      maxHandler={maxHandler}
      setValue={setFromBeanValue}
      token={SiloAsset.Bean}
      value={fromBeanValue}
    />
  );

  /* Output Fields */
  const toBurnStalkField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Stalk}
      value={toStalkValue}
    />
  );
  const toBurnSeedsField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Seed}
      value={toSeedsValue}
    />
  );
  const toTransitBeanField = (
    <TokenOutputField mint token={TransitAsset.Bean} value={fromBeanValue} />
  );

  /* Transaction Details, settings and text */

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

  const beanOutput = new BigNumber(fromBeanValue);

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
  details.push(`Withdraw ${displayBN(beanOutput)}
    ${beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'} from the Silo`);
  details.push(
    `Burn ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(
      new BigNumber(toSeedsValue)
    )} Seeds`
  );

  const showSettings = hasClaimable ? (
    <SettingsFormModule
      hasClaimable={hasClaimable}
      showUnitModule={false}
      setSettings={setSettings}
      settings={settings}
    />
  ) : null;
  const stalkChangePercent = toStalkValue
    .dividedBy(totalStalk)
    .multipliedBy(100);

  function transactionDetails() {
    if (fromBeanValue.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toBurnStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toBurnSeedsField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toTransitBeanField}
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
            {`You will forfeit ${smallDecimalPercent(
              stalkChangePercent
            )}% ownership of Beanstalk.`}
          </span>
          <br />
          <span style={{ color: 'red', fontSize: 'calc(9px + 0.5vmin)' }}>
            {siloStrings.withdrawWarning.replace('{0}', withdrawSeasons)}
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromBeanValue.isLessThanOrEqualTo(0) ||
        withdrawParams.crates.length === 0 ||
        withdrawParams.amounts.length === 0
      ) {
        return;
      }
      if (settings.claim) {
        // Toast
        const txToast = new TransactionToast({
          loading: `Claiming and withdrawing ${displayBN(fromBeanValue)} Beans`,
          success: `Claimed and withdrew of ${displayBN(fromBeanValue)} Beans`,
        });

        // Execute
        claimAndWithdrawBeans(
          withdrawParams.crates,
          withdrawParams.amounts,
          claimable,
          (response) => {
            fromValueUpdated(new BigNumber(-1));
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
          loading: `Withdrawing ${displayBN(fromBeanValue)} Beans`,
          success: `Withdrew ${displayBN(fromBeanValue)} Beans`,
        });

        // Execute
        withdrawBeans(
          withdrawParams.crates,
          withdrawParams.amounts,
          (response) => {
            fromValueUpdated(new BigNumber(-1));
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
      {transactionDetails()}
      {showSettings}
    </>
  );
});

export default BeanWithdrawAction;
