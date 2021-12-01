import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, BEAN_TO_SEEDS, SEEDS, STALK } from 'constants/index';
import {
  claimAndWithdrawBeans,
  displayBN,
  MinBN,
  MinBNs,
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
} from 'components/Common';

export const BeanWithdrawModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  /* function maxBeans(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(props.crates).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerBean = (new BigNumber(10000)).plus(props.season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerBean.multipliedBy(props.crates[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerBean.multipliedBy(props.crates[key]))
        beans = beans.plus(props.crates[key])
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
    Object.keys(props.crates)
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .some((key) => {
        const crateBeansRemoved = beansRemoved
          .plus(props.crates[key])
          .isLessThanOrEqualTo(beans)
          ? props.crates[key]
          : beans.minus(beansRemoved);
        beansRemoved = beansRemoved.plus(crateBeansRemoved);
        stalkRemoved = stalkRemoved.plus(crateBeansRemoved);
        stalkRemoved = stalkRemoved.plus(
          crateBeansRemoved
            .multipliedBy(props.season.minus(key))
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
    const fromNumber = MinBN(newFromNumber, props.maxFromBeanVal);
    const newFromBeanValue = TrimBN(fromNumber, BEAN.decimals);
    setFromBeanValue(newFromBeanValue);
    setToStalkValue(TrimBN(getStalkRemoved(fromNumber), STALK.decimals));
    setToSeedsValue(
      TrimBN(fromNumber.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals)
    );
    props.setIsFormDisabled(newFromBeanValue.isLessThanOrEqualTo(0));
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
      props.maxToSeedsVal.multipliedBy(props.seedsToBean),
      props.maxToStalkVal.multipliedBy(props.stalkToBean),
      props.maxFromBeanVal,
    ]);
    if (props.locked) {
      fromValueUpdated(new BigNumber(-1));
    } else {
      fromValueUpdated(minMaxFromVal);
    }
  };

  /* Input Fields */

  const fromBeanField = (
    <TokenInputField
      balance={props.maxFromBeanVal}
      claim={props.settings.claim}
      claimableBalance={props.beanClaimableBalance}
      handleChange={handleFromChange}
      locked={props.locked || props.maxFromBeanVal.isLessThanOrEqualTo(0)}
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
  const beanOutput = new BigNumber(fromBeanValue);

  details.push(`Withdraw ${displayBN(beanOutput)}
    ${beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'} from the Silo`);
  details.push(
    `Burn ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(
      new BigNumber(toSeedsValue)
    )} Seeds`
  );

  const unvoteTextField = props.locked ? (
    <Box style={{ marginTop: '-5px', fontFamily: 'Futura-PT-Book' }}>
      Unvote Active BIPs to Withdraw
    </Box>
  ) : null;
  const showSettings = props.hasClaimable ? (
    <SettingsFormModule
      hasClaimable={props.hasClaimable}
      showUnitModule={false}
      setSettings={props.setSettings}
      settings={props.settings}
    />
  ) : null;
  const stalkChangePercent = toStalkValue
    .dividedBy(props.totalStalk)
    .multipliedBy(100);

  function transactionDetails() {
    if (fromBeanValue.isLessThanOrEqualTo(0) || props.locked) return;

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
            {siloStrings.withdrawWarning}
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

      if (props.settings.claim) {
        claimAndWithdrawBeans(
          withdrawParams.crates,
          withdrawParams.amounts,
          props.claimable,
          () => {
            fromValueUpdated(new BigNumber(-1));
          }
        );
      } else {
        withdrawBeans(withdrawParams.crates, withdrawParams.amounts, () => {
          fromValueUpdated(new BigNumber(-1));
        });
      }
    },
  }));

  return (
    <>
      {fromBeanField}
      {unvoteTextField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});
