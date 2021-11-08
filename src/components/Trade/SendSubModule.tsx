import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { BASE_ETHERSCAN_ADDR_LINK, BEAN } from '../../constants';
import {
  displayBN,
  isAddress,
  MinBN,
  TrimBN,
} from '../../util';
import {
  AddressInputField,
  CryptoAsset,
  TokenInputField,
  TransactionDetailsModule,
} from '../Common';

export default function SendSubModule(props) {
  const [snappedToAddress, setSnappedToAddress] = useState(false);
  const [walletText, setWalletText] = useState('');

  const fromValueUpdated = (newFromNumber) => {
    const fromNumber = MinBN(newFromNumber, props.maxFromBeanVal);
    props.setFromBeanValue(TrimBN(fromNumber, BEAN.decimals));
  };

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };

  async function toAddressUpdated(newToAddress) {
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

  const maxHandler = () => {
    fromValueUpdated(props.maxFromBeanVal);
  };
  const clearHandler = () => {
    toAddressUpdated(walletText);
  };

  /* Input Fields */

  const toAddressField = (
    <AddressInputField
      address={walletText}
      setAddress={props.setWalletText}
      fromAddress={props.address}
      handleChange={handleChange}
      marginTop={window.innerWidth > 400 ? '8px' : '7px'}
      snapped={snappedToAddress}
      handleClear={clearHandler}
      isValidAddress={props.isValidAddress}
    />
  );
  const fromBeanField = (
    <TokenInputField
      hidden={props.toAddress.length !== 42 || props.isValidAddress !== true}
      token={CryptoAsset.Bean}
      value={props.fromBeanValue}
      setValue={fromValueUpdated}
      handleChange={handleFromChange}
      balance={props.maxFromBeanVal}
      maxHandler={maxHandler}
    />
  );

  /* Transaction Details, settings and text */

  const details = [];
  details.push(
    <span>
      {`- Send ${displayBN(props.fromBeanValue)} Beans to`}
      <a
        href={`${BASE_ETHERSCAN_ADDR_LINK}${props.toAddress}`}
        color="inherit"
        target="blank"
      >
        {`${walletText}`}
      </a>`.`
    </span>
  );

  function transactionDetails() {
    if (props.fromBeanValue.isLessThanOrEqualTo(0)
      || props.toAddress.length !== 42
      || props.isValidAddress !== true
    ) return null;

    return (
      <>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  return (
    <>
      {toAddressField}
      {fromBeanField}
      {transactionDetails()}
    </>
  );
}
