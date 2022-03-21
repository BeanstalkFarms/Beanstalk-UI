import Web3 from 'web3';
// import {
//   init,
//   useConnectWallet,
//   useSetChain,
//   useWallets
// } from '@web3-onboard/react'
import Onboard, { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';

import { ethers } from 'ethers';
import {
  BEANFTCOLLECTION,
  BEANFTGENESIS,
  BEANSTALK,
  CURVE,
  PRICE,
  UNISWAP_V2_ROUTER,
  INFURA_API_KEY,
  SupportedToken,
  changeTheme,
} from 'constants/index';
import {
  BEAN, changeAddresses
} from 'constants/tokens';
import { Token as SupportedV2Token } from 'classes';
import { CHAIN_IDS_TO_NAMES, SupportedChainId } from 'constants/chains';
import { INFURA_NETWORK_URLS } from 'constants/infura';

export * from './EventUtilities';
export * from './FieldUtilities';
export * from './GovernanceUtilities';
export * from './LedgerUtilities';
export * from './SeasonUtilities';
export * from './SiloUtilities';
export * from './CurveUtilities';
export * from './TokenUtilities';
export * from './TimeUtilities';
export * from './UniswapUtilities';
export * from './TimeUtilities';
export * from './BeaNFTUtilities';
export * from './APYUtilities';
export * from './FundraiserUtilities';
export * from './MarketUtilities';

const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/23db69ab62394f4eb41db6a21853402c';

let ethereum;
export let initializing;
/** txCallback is called after each successful request to the chain. */
export let txCallback : Function | undefined;
export let web3 : Web3;
export let account : string;
export let metamaskFailure = -1;
export let chainId : SupportedChainId = 1;

export let web3Provider : ethers.providers.Web3Provider;
export let web3Signer : ethers.providers.JsonRpcSigner;

const beanAbi = require('../constants/abi/Bean.json');
const beanstalkAbi = require('../constants/abi/Beanstalk.json');
const beaNFTAbi = require('../constants/abi/BeaNFT.json');
const BeaNFTGenesisABI = require('../constants/abi/BeaNFTGenesis.json');
const uniswapPairAbi = require('../constants/abi/UniswapV2Pair.json');
const uniswapRouterAbi = require('../constants/abi/UniswapV2Router02.json');
const curveMetaPoolAbi = require('../constants/abi/BeanCrv3MetaPool.json');
const beanstalkPriceAbi = require('../constants/abi/BeanstalkPrice.json');

export const tokenContract = (token: SupportedToken) =>
  new ethers.Contract(token.addr, beanAbi, web3Signer);

export const tokenContractReadOnly = (token: SupportedToken) =>
  new web3.eth.Contract(beanAbi, token.addr);

export const tokenV2ContractReadOnly = (token: SupportedV2Token) =>
  new web3.eth.Contract(beanAbi, token.address);

export const beanstalkPriceContractReadOnly = () =>
  new web3.eth.Contract(beanstalkPriceAbi, PRICE.addr);

export const beanstalkContract = () =>
  new ethers.Contract(BEANSTALK, beanstalkAbi, web3Signer);

export const beanstalkContractReadOnly = () =>
  new web3.eth.Contract(beanstalkAbi, BEANSTALK);

export const beaNFTContract = () =>
  new ethers.Contract(BEANFTCOLLECTION, beaNFTAbi, web3Signer);
export const beaNFTContractReadOnly = () =>
  new web3.eth.Contract(beaNFTAbi, BEANFTCOLLECTION);

export const beaNFTGenesisContract = () =>
  new ethers.Contract(BEANFTGENESIS, BeaNFTGenesisABI, web3Signer);
export const beaNFTGenesisContractReadOnly = () =>
  new web3.eth.Contract(BeaNFTGenesisABI, BEANFTGENESIS);

export const pairContract = (pair: SupportedToken) =>
  new ethers.Contract(pair.addr, uniswapPairAbi, web3Signer);
export const pairContractReadOnly = (pair: SupportedToken) =>
  new web3.eth.Contract(uniswapPairAbi, pair.addr);

export const uniswapRouterContract = () =>
  new ethers.Contract(UNISWAP_V2_ROUTER, uniswapRouterAbi, web3Signer);

export const curveContract = () =>
  new ethers.Contract(CURVE.addr, curveMetaPoolAbi, web3Signer);

export const beanCrv3ContractReadOnly = () =>
  new web3.eth.Contract(curveMetaPoolAbi, CURVE.addr);

export const curveContractReadOnly = () =>
  new web3.eth.Contract(curveMetaPoolAbi, CURVE.factory);

// async function initializeMetaMaskListeners() {
//   const changeHandler = () => {
//     window.location.replace(window.location.origin);
//   };
//   ethereum.on('accountsChanged', changeHandler);
//   ethereum.on('chainChanged', changeHandler);
// }

const walletConnect = walletConnectModule({
  qrcodeModalOptions: {
    mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
  }
});
const injected = injectedModule();

//
let onboard : OnboardAPI | undefined;
if(!onboard) {
  onboard = Onboard({
    wallets: [injected, walletConnect],
    chains: [
      {
        id: '0x1',
        token: 'ETH',
        label: 'Ethereum Mainnet',
        rpcUrl: MAINNET_RPC_URL
      },
      {
        id: '0x3',
        token: 'tROP',
        label: 'Ethereum Ropsten Testnet',
        rpcUrl: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      },
    ],
    appMetadata: {
      name: 'My App',
      icon: '<SVG_ICON_STRING>',
      description: 'My app using Onboard'
    }
  });
}

/**
 * 
 * @param _chainId 
 * @returns 
 */
export function getRpcEndpoint(_chainId: SupportedChainId) {
  return INFURA_NETWORK_URLS[_chainId];
}

/**
 * Switch our RPC endpoint
 * @param _chainId 
 */
export async function switchChain(_chainId: SupportedChainId) {
  if(!onboard) throw new Error('Onboard is not yet initialized.');
  const currentState = onboard.state.get();
  
  // Update chain information, tokens, theme
  chainId = _chainId;
  changeAddresses(chainId);
  if (chainId === 1) changeTheme('winterUpgrade');
  if (chainId === 3) changeTheme('ropsten');
  
  // Create web3 / ethers instances.
  const rpcUrl = getRpcEndpoint(chainId);
  web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  web3Provider = new ethers.providers.Web3Provider(
    currentState.wallets[0].provider,   // the provider instance from web3-onboard
    CHAIN_IDS_TO_NAMES[chainId],        // "mainnet" or "ropsten"
  );
  web3Signer = web3Provider.getSigner();
}

//
export async function initialize(): Promise<boolean> {
  if(metamaskFailure > -1) {
    console.warn(`initialize: already executed.`)
    return false;
  }

  if(!onboard) {
    console.warn('initialize: missing onboard instance');
    return false;
  }

  // previous logic work switched out in this commit for reference: https://github.com/BeanstalkFarms/Beanstalk-UI/commit/61199814d0f45b7433606f159751f364bf68d941
  // WIP: Metamask can be connected but walletconnect, switching chains and signers is not working atm
  // const currentState = onboard.state.get();
  // console.log('initialize: currentState', currentState);
  // if (currentState.wallets.length === 0) {
  //   console.log('initialize: If no wallet in state');
  // }
  // if (currentState.chains.length === 0) {
  //   console.log('initialize: if no chain in state');
  // }
  
  // Request a wallet connection and initialize a web3 provider.
  const wallets = await onboard.connectWallet();

  // Convert the hex chain ID returned by web3-onboard
  // into our decimal format. Switch 
  const chainHexId = wallets[0].chains[0].id;
  chainId = parseInt(chainHexId, 16);
  switchChain(chainId);
  account = wallets[0].accounts[0].address;
  
  // TEST: getBalance
  // await web3.eth.getBalance(account).then((result) => {
  //   console.log(`account ${account} has balance ${result}`);
  // });
  // console.log('initialize: wallets', wallets);

  //
  if (account === undefined) {
    console.log(`initialize: account = undefined`);
    metamaskFailure = 2;
    return false;
  }

  metamaskFailure = 1;
  return true;
}

// Used in MetamasklessModule 
export async function switchToMainnet() {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
    return true;
  } catch {
    return false;
  }
}

export async function addTokenToMetamask() {
  return ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20', // Initially only supports ERC20, but eventually more!
      options: {
        address: BEAN.addr,       // The address that the token is at.
        symbol: BEAN.symbol,      // A ticker symbol or shorthand, up to 5 chars.
        decimals: BEAN.decimals,  // The number of decimals in the token
        image: 'https://app.bean.money/assets/beanstalk-logo-square.png', // A string url of the token logo
      },
    },
  });
}

/**
 * Defined as a function so we can update the "global" txCallback var
 * from outside of this file.
 */
export function initializeCallback(callback: () => any) {
  txCallback = callback;
}

export async function isAddress(a: string) {
  return ethers.utils.isAddress(a);
}

export async function GetWalletAddress(): Promise<string | undefined> {
  await initializing;
  return account;
}
