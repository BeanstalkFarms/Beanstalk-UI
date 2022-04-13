import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BEAN } from 'constants/index';
import { displayBN, harvest, toStringBaseUnitBN, TrimBN } from 'util/index';
import {
  CryptoAsset,
  FarmAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';
import { UserBalanceState } from 'state/userBalance/reducer';
import TransactionToast from 'components/Common/TransactionToast';
import { makeStyles } from '@mui/styles';

type HarvestModuleProps = {
  setIsFormDisabled: Function;
  harvestablePodBalance: UserBalanceState['harvestablePodBalance'];
  harvestablePlots: UserBalanceState['harvestablePlots'];
};

const useStyles = makeStyles({
  expandMoreIcon: {
    marginBottom: '-14px',
    width: '100%'
  },
  boxStyle: {
    display: 'inline-block',
    width: '100%'
  }
});

export const HarvestModule = forwardRef((props: HarvestModuleProps, ref) => {
  const classes = useStyles();
  props.setIsFormDisabled(props.harvestablePodBalance.isLessThanOrEqualTo(0));

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
          className={classes.expandMoreIcon}
        />
        <Box className={classes.boxStyle}>
          {toBeanField}
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return;

      // Toast
      const txToast = new TransactionToast({
        loading: `${displayBN(props.harvestablePodBalance)} Pod Harvest pending.`,
        success: `${displayBN(props.harvestablePodBalance)} Pod Harvest successful.`,
      });

      // Execute
      harvest(
        // plots
        Object.keys(props.harvestablePlots).map((key) =>
          toStringBaseUnitBN(new BigNumber(key), BEAN.decimals)
        ),
        (response) => {
          txToast.confirming(response);
        }
      )
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        txToast.error(err);
      });
    },
  }));

  return (
    <>
      {fromPodField}
      {transactionDetails()}
    </>
  );
});
