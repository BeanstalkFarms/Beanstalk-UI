import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@mui/material';
import { BASE_ETHERSCAN_ADDR_LINK, BEAN, theme } from 'constants/index';
import {
  displayBN,
  isAddress,
  toStringBaseUnitBN,
  MaxBN,
  MinBN,
  transferPlot,
  TrimBN,
} from 'util/index';
import {
  AddressInputField,
  PlotListInputField,
  PlotInputField,
  fieldStrings,
  TransactionDetailsModule,
} from 'components/Common';
import TransactionToast from 'components/Common/TransactionToast';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  walletText: {
    color: theme.backgroundText
  },
  errorMessage: {
    color: 'red'
  },
  plotWarning: {
    display: 'inline-block',
    width: '100%',
    color: 'red'
  },
  fromIndexField: {
    marginRight: '5px'
  },
  fromIndexEndField: {
    marginLeft: '5px'
  },
  inlineFlex: {
    display: 'inline-flex'
  },
  inlineBlock: {
    display: 'inline-block'
  }
});

export const SendPlotModule = forwardRef((props, ref) => {
  const classes = useStyles();
  const [plotId, setPlotId] = useState(new BigNumber(-1));
  const [plotEndId, setPlotEndId] = useState(new BigNumber(-1));
  const [fromPlotIndex, setFromPlotIndex] = useState(new BigNumber(-1));
  const [toPlotEndIndex, setToPlotEndIndex] = useState(new BigNumber(-1));
  const [snappedToAddress, setSnappedToAddress] = useState(false);
  const [walletText, setWalletText] = useState('');

  const width = window.innerWidth;

  /* Handlers: Plot change and update */
  function fromValueUpdated(newFromNumber: BigNumber) {
    setPlotEndId(TrimBN(newFromNumber, BEAN.decimals)); // set plot max pod size
    setToPlotEndIndex(TrimBN(newFromNumber, BEAN.decimals));
    props.setIsFormDisabled(newFromNumber.isLessThanOrEqualTo(0));
  }
  function fromIndexValueUpdated(newFromIndexNumber: BigNumber, newToIndexNumber: BigNumber) {
    const newFromIndexValue = MinBN(
      new BigNumber(newFromIndexNumber),
      plotEndId
    );
    const newToEndIndexValue = MaxBN(
      newFromIndexValue,
      MinBN(new BigNumber(newToIndexNumber), plotEndId)
    );
    props.setIsFormDisabled(newFromIndexValue.isEqualTo(newToEndIndexValue));
    setFromPlotIndex(TrimBN(newFromIndexValue, BEAN.decimals));
    setToPlotEndIndex(TrimBN(newToEndIndexValue, BEAN.decimals));
  }
  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(props.plots[event.target.value]));
      setPlotId(event.target.value);
      setFromPlotIndex(new BigNumber(0)); // reset plot start index
      if (props.plots[event.target.value] === undefined) {
        props.setIsFormDisabled(true);
        // fromValueUpdated(new BigNumber(-1));
      }
    } else {
      fromValueUpdated(new BigNumber(-1));
      props.setIsFormDisabled(true);
    }
  };
  const handleFromIndexChange = (event) => {
    if (event.target.value) {
      fromIndexValueUpdated(event.target.value, toPlotEndIndex);
    } else {
      fromIndexValueUpdated(new BigNumber(0), toPlotEndIndex);
    }
  };
  const handleFromIndexEndChange = (event) => {
    if (event.target.value) {
      fromIndexValueUpdated(fromPlotIndex, event.target.value);
    } else {
      fromIndexValueUpdated(fromPlotIndex, plotEndId);
    }
  };

  /* Handlers: Address change and update */
  async function toAddressUpdated(newToAddress: string) {
    if (snappedToAddress) {
      fromValueUpdated(new BigNumber(-1));
      props.setToAddress('');
      setWalletText('');
      setSnappedToAddress(false);
      return;
    }

    if (newToAddress.length === 42) {
      setWalletText(
        `${newToAddress.substring(0, 6)}...${newToAddress.substring(
          newToAddress.length - 4
        )}`
      );
      setSnappedToAddress(true);
      props.setIsValidAddress(await isAddress(newToAddress));
    } else {
      setWalletText('');
      props.setIsFormDisabled(true);
    }
    props.setToAddress(newToAddress);
  }
  const handleChange = (event) => {
    if (event.target.value) {
      toAddressUpdated(event.target.value);
    } else {
      toAddressUpdated('');
    }
  };
  const clearHandler = () => {
    toAddressUpdated(walletText);
  };
  const maxHandler = () => {
    fromIndexValueUpdated(fromPlotIndex, plotEndId);
  };
  const minHandler = () => {
    fromIndexValueUpdated(MinBN(fromPlotIndex, new BigNumber(0)), plotEndId);
  };

  /* Input Fields */
  const toAddressField = (
    <AddressInputField
      address={walletText}
      setAddress={setWalletText}
      handleChange={handleChange}
      marginTop="0px"
      snapped={snappedToAddress}
      handleClear={clearHandler}
      isValidAddress={props.isValidAddress}
    />
  );
  const fromPlotField = (
    <PlotListInputField
      hidden={
        props.toAddress.length !== 42 ||
        walletText === '' ||
        props.isValidAddress !== true
      }
      index={props.index}
      items={props.plots}
      marginBottom={props.hasPlots === true ? '0px' : '-7px'}
      handleChange={handleFromChange}
    />
  );
  const fromIndexField = (
    <PlotInputField
      key={0}
      hidden={props.isFormDisabled && !fromPlotIndex.isEqualTo(toPlotEndIndex)}
      balance={plotEndId}
      handleChange={handleFromIndexChange}
      label="Start Index"
      value={new BigNumber(fromPlotIndex)}
      minHandler={minHandler}
    />
  );
  const fromIndexEndField = (
    <PlotInputField
      key={0}
      hidden={props.isFormDisabled && !fromPlotIndex.isEqualTo(toPlotEndIndex)}
      balance={plotEndId}
      handleChange={handleFromIndexEndChange}
      label="End Index"
      value={toPlotEndIndex}
      maxHandler={maxHandler}
    />
  );

  /* Transaction Details, settings and text */
  let details = [];
  function displaySendPlot(firstText: string, secondText: string) {
    details.push(
      <span>
        {`Send ${firstText}Plot #${displayBN(
          new BigNumber(plotId - props.index).plus(fromPlotIndex)
        )} to `}
        <a
          href={`${BASE_ETHERSCAN_ADDR_LINK}${props.toAddress}`}
          target="blank"
          className={classes.walletText}
        >
          {`${walletText}`}
        </a>
      </span>
    );
    details.push(`Send ${firstText === '' ? 'all' : ''}
      ${displayBN(toPlotEndIndex)} Pods ${secondText} the Plot`);
  }

  if (toPlotEndIndex.minus(fromPlotIndex).isEqualTo(plotEndId)) {
    // full plot
    displaySendPlot('', 'in');
  } else if (fromPlotIndex.isEqualTo(0)) {
    // front of plot
    displaySendPlot('part of ', 'from the front of');
  } else if (toPlotEndIndex.isEqualTo(plotEndId)) {
    // back of plot
    displaySendPlot('part of ', 'from the end of');
  } else if (
    !toPlotEndIndex.minus(fromPlotIndex).isEqualTo(plotEndId) &&
    !fromPlotIndex.isEqualTo(0)
  ) {
    // middle of plot
    displaySendPlot('part of ', 'in the middle of');
  }

  if (toPlotEndIndex.isEqualTo(fromPlotIndex)) {
    details = [<span className={classes.errorMessage}>Invalid transfer amount</span>];
  }

  /* */
  function TransactionDetails() {
    if (toPlotEndIndex.isLessThanOrEqualTo(0)) return null;
    return (
      <>
        <Box className={width > 50 ? classes.inlineFlex : classes.inlineBlock}>
          <Box className={classes.fromIndexField}>{fromIndexField}</Box>
          <Box className={classes.fromIndexEndField}>{fromIndexEndField}</Box>
        </Box>
        <TransactionDetailsModule
          fields={details}
        />
        <Box className={classes.plotWarning}>
          <span>{fieldStrings.sendPlotWarning}</span>
        </Box>
      </>
    );
  }

  /* */
  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPlotEndIndex.isLessThanOrEqualTo(0)) return;
      if (toPlotEndIndex.isGreaterThan(0)) {
        // Contract Inputs
        const startPlot = toStringBaseUnitBN(fromPlotIndex, BEAN.decimals);
        const endPlot = toStringBaseUnitBN(toPlotEndIndex, BEAN.decimals);
        const id = toStringBaseUnitBN(plotId, BEAN.decimals);

        // Toast
        const txToast = new TransactionToast({
          loading: `Plot ${startPlot}-${endPlot} send to ${props.toAddress.substring(0, 6)} pending. `,
          success: `Plot ${startPlot}-${endPlot} send to ${props.toAddress.substring(0, 6)} successful.`,
        });

        // Execute
        transferPlot(
          props.toAddress,
          id,
          startPlot,
          endPlot,
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
        fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
      }
    },
  }));

  return (
    <>
      {toAddressField}
      {fromPlotField}
      <TransactionDetails />
    </>
  );
});
