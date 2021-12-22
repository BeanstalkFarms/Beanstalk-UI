import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useDispatch } from 'react-redux';
import { BEAN } from 'constants/index';
import { displayBN, harvest, toStringBaseUnitBN, TrimBN } from 'util/index';
import {
  CryptoAsset,
  FarmAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';
import { useLatestTransactionNumber } from 'state/general/hooks';
import {
  addTransaction,
  completeTransaction,
  State,
  updateTransactionHash,
} from 'state/general/actions';
import { UserBalanceState } from 'state/userBalance/reducer';

type HarvestModuleProps = {
  setIsFormDisabled: Function;
  harvestablePodBalance: UserBalanceState['harvestablePodBalance'];
  harvestablePlots: UserBalanceState['harvestablePlots'];
};

export const HarvestModule = forwardRef((props: HarvestModuleProps, ref) => {
  props.setIsFormDisabled(props.harvestablePodBalance.isLessThanOrEqualTo(0));
  const dispatch = useDispatch();
  const latestTransactionNumber = useLatestTransactionNumber();

  /* Input Fields */
  const fromPodField = (
    <TokenInputField
      balance={props.harvestablePodBalance}
      token={FarmAsset.Pods}
      value={TrimBN(props.harvestablePodBalance, 6)}
    />
  );

  /* Output Fields */
  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(props.harvestablePodBalance, BEAN.decimals)}
    />
  );

  /* Transaction Details, settings and text */
  const details = [
    `Harvest ${displayBN(props.harvestablePodBalance)} Pods`,
    `Receive ${displayBN(props.harvestablePodBalance)} Beans`,
  ];

  function transactionDetails() {
    if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toBeanField}
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return;
      const transactionNumber = latestTransactionNumber + 1;
      dispatch(
        addTransaction({
          transactionNumber,
          description: 'Doing harvest',
          state: State.PENDING,
        })
      );
      harvest(
        Object.keys(props.harvestablePlots).map((key) =>
          toStringBaseUnitBN(new BigNumber(key), BEAN.decimals)
        ),
        (transactionHash) => {
          dispatch(
            updateTransactionHash({
              transactionNumber,
              transactionHash,
            })
          );
        },
        () => {
          dispatch(completeTransaction(transactionNumber));
        }
      );
    },
  }));

  return (
    <>
      {fromPodField}
      {transactionDetails()}
    </>
  );
});
