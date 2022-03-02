import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { SwapWidget } from '@uniswap/widgets/dist/index.js';
import '@uniswap/widgets/dist/fonts.css';

import { AppState } from 'state';
import { updateUniswapBeanAllowance } from 'state/allowances/actions';
import { BEAN } from 'constants/index';
import {
  approveUniswapBean,
  toStringBaseUnitBN,
  transferBeans,
  web3Provider,
} from 'util/index';

import { BaseModule, CryptoAsset, Grid, tradeStrings } from 'components/Common';
import TransactionToast from 'components/Common/TransactionToast';
import { JSON_RPC_ENDPOINT } from 'constants/values';
import SendModule from './SendModule';

const WIDGET_TOKEN_LIST = [
  {
    name: 'Bean',
    address: '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    symbol: 'Bean',
    decimals: 6,
    chainId: 1,
    logoURI:
      'https://github.com/BeanstalkFarms/Beanstalk/blob/master/assets/bean-64x64.png?raw=true',
  },
];

export default function TradeModule() {
  const { beanBalance } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const [section, setSection] = useState(0);
  const sectionTitles = ['Send'];
  const sectionTitlesDescription = [tradeStrings.send];

  /* Swap Sub-Module state */
  const [fromValue, setFromValue] = useState(new BigNumber(-1));
  const [toValue, setToValue] = useState(new BigNumber(-1));

  /* Send Sub-Module state */
  const [toAddress, setToAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  function handleSwapCallback() {
    setFromValue(new BigNumber(-1));
    setToValue(new BigNumber(-1));
  }

  const handleTabChange = (event, newSection) => {
    handleSwapCallback();
    setToAddress('');
    setSection(newSection);
  };

  const handleForm = () => {
    if (fromValue.isGreaterThan(0)) {
      // Toast
      const txToast = new TransactionToast({
        loading: `Transfering ${fromValue} Beans to ${toAddress.substring(
          0,
          6
        )}`,
        success: `Sent ${fromValue} Beans to ${toAddress.substring(0, 6)}`,
      });

      // Execute
      transferBeans(
        toAddress,
        toStringBaseUnitBN(fromValue, BEAN.decimals),
        (response) => txToast.confirming(response)
      )
        .then((value) => {
          handleSwapCallback();
          txToast.success(value);
        })
        .catch((err) => {
          txToast.error(err);
        });
    }
  };

  const disabled =
    section === 0
      ? toValue.isLessThanOrEqualTo(0)
      : fromValue.isLessThanOrEqualTo(0) ||
        toAddress.length !== 42 ||
        isValidAddress !== true;

  return (
    <Grid
      container
      item
      xs={12}
      alignItems="center"
      justifyContent="center"
      direction="column"
    >
      <Grid item xs={9} sm={8} style={{ maxWidth: '500px' }}>
        <SwapWidget
          provider={web3Provider}
          width={500}
          defaultInputAddress="NATIVE"
          defaultOutputAddress="0xDC59ac4FeFa32293A95889Dc396682858d52e5Db"
          tokenList={WIDGET_TOKEN_LIST}
          jsonRpcEndpoint={JSON_RPC_ENDPOINT}
        />
        <BaseModule
          isDisabled={disabled}
          section={section}
          sectionTitles={sectionTitles}
          sectionTitlesDescription={sectionTitlesDescription}
          setAllowance={updateUniswapBeanAllowance}
          handleApprove={approveUniswapBean}
          handleForm={handleForm}
          handleTabChange={handleTabChange}
          marginTop="16px"
        >
          <SendModule
            toAddress={toAddress}
            setToAddress={setToAddress}
            fromAddress=""
            fromBeanValue={fromValue}
            isValidAddress={isValidAddress}
            setIsValidAddress={setIsValidAddress}
            setFromBeanValue={setFromValue}
            maxFromBeanVal={beanBalance}
            fromToken={CryptoAsset.Bean}
          />
        </BaseModule>
      </Grid>
    </Grid>
  );
}
