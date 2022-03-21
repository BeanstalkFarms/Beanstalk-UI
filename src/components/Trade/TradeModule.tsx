import React from 'react';
// import BigNumber from 'bignumber.js';
// import { useSelector } from 'react-redux';
import { SwapWidget } from '@uniswap/widgets/dist/index.js';
import { Grid, makeStyles } from '@material-ui/core';
import '@uniswap/widgets/dist/fonts.css';

// import { AppState } from 'state';
import { BEAN, DAI, TETHER, USDC } from 'constants/index';
import {
  // toStringBaseUnitBN,
  // transferBeans,
  web3Provider,
  getRpcEndpoint,
  chainId
} from 'util/index';

// import { tradeStrings } from 'components/Common';
// import TransactionToast from 'components/Common/TransactionToast';

const WIDGET_TOKEN_LIST = [
  // List of top tokens on Uniswap V2 that have liquidity.
  // https://v2.info.uniswap.org/tokens
  // Bean uses the same address across all 3 chains
  ...[1, 3, 1337].map((_chainId: number) => ({
    name: 'Bean',
    address: BEAN.addr,
    symbol: BEAN.symbol,
    decimals: BEAN.decimals,
    chainId: _chainId,
    logoURI:
      'https://github.com/BeanstalkFarms/Beanstalk/blob/master/assets/bean-64x64.png?raw=true',
  })),
  // Other mainnet tokens
  {
    name: 'USD Coin',
    address: USDC.addr,
    symbol: USDC.symbol,
    decimals: USDC.decimals,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    name: 'Tether',
    address: TETHER.addr,
    symbol: TETHER.symbol,
    decimals: TETHER.decimals,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  },
  {
    name: 'Fei',
    address: '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
    symbol: 'FEI',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x956f47f50a910163d8bf957cf5846d573e7f87ca/logo.png',
  },
  {
    name: 'Frax',
    address: '0x853d955acef822db058eb8505911ed77f175b99e',
    symbol: 'FRAX',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x853d955acef822db058eb8505911ed77f175b99e/logo.png',
  },
  {
    name: 'Frax Share',
    address: '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
    symbol: 'FXS',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0/logo.png',
  },
  {
    name: 'Wrapped BTC',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    symbol: 'WBTC',
    decimals: 8,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/logo.png',
  },
  {
    name: 'Dai',
    address: DAI.addr,
    symbol: DAI.symbol,
    decimals: DAI.decimals,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'Uniswap',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    symbol: 'UNI',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984/logo.png',
  },
  // Ropsten tokens
  {
    name: 'USD Coin',
    address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    symbol: USDC.symbol,
    decimals: USDC.decimals,
    chainId: 3,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  }
];

const useStyles = makeStyles(() => ({
  widget: {}
}));

// https://docs.uniswap.org/sdk/widgets/swap-widget#installing-library
const swapWidgetTheme = {
  tokenColorExtraction: false,
  borderRadius: 15,
  // container: "transparent", // main background
  // module: "hsl(231,14%,92%)", // defaut hsl(231,14%,90%)
};

export default function TradeModule() {
  const classes = useStyles();
  return (
    <Grid
      container
      item
      xs={12}
      alignItems="center"
      justifyContent="center"
      direction="column"
    >
      <Grid
        item
        xs={9}
        sm={8}
        style={{
          maxWidth: '500px',
          backgroundColor: 'hsl(220,23%,97.5%)',
          padding: '3px 3px 12px 3px',
          borderRadius: 15 
        }}
      >
        <SwapWidget
          theme={swapWidgetTheme}
          provider={web3Provider}
          width="100%"
          defaultInputAddress="NATIVE"
          defaultOutputAddress={BEAN.addr}
          tokenList={WIDGET_TOKEN_LIST}
          jsonRpcEndpoint={getRpcEndpoint(chainId)}
          className={classes.widget}
        />
      </Grid>
    </Grid>
  );
}

/*
  const { beanBalance } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const [section, setSection] = useState(0);
  const sectionTitles = ['Send'];
  const sectionTitlesDescription = [tradeStrings.send];

  const [fromValue, setFromValue] = useState(new BigNumber(-1));
  const [toValue, setToValue] = useState(new BigNumber(-1));

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
*/
/* 
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
</BaseModule> */
