import Web3 from 'web3';
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'

import { ethers } from 'ethers';
import {
  BEANFTCOLLECTION,
  BEANFTGENESIS,
  BEANSTALK,
  CURVE,
  PRICE,
  UNISWAP_V2_ROUTER,
  changeNetwork,
} from 'constants/index';

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

const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/9d1f966887eb483696b887c83bce72e8'

let ethereum;
export let initializing;
/** txCallback is called after each successful request to the chain. */
export let txCallback : Function | undefined;
export let web3 : Web3;
export let account : string;
export let metamaskFailure = -1;
export const chainId = 1;

export let web3Provider;
export let web3Signer;

const beanAbi = require('../constants/abi/Bean.json');
const beanstalkAbi = require('../constants/abi/Beanstalk.json');
const beaNFTAbi = require('../constants/abi/BeaNFT.json');
const BeaNFTGenesisABI = require('../constants/abi/BeaNFTGenesis.json');
const uniswapPairAbi = require('../constants/abi/UniswapV2Pair.json');
const uniswapRouterAbi = require('../constants/abi/UniswapV2Router02.json');
const curveMetaPoolAbi = require('../constants/abi/BeanCrv3MetaPool.json');
const beanstalkPriceAbi = require('../constants/abi/BeanstalkPrice.json');

export const tokenContract = (token) =>
  new ethers.Contract(token.addr, beanAbi, web3Signer);

export const tokenContractReadOnly = (token) =>
  new web3.eth.Contract(beanAbi, token.addr);

export const tokenV2ContractReadOnly = (token) =>
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

export const pairContract = (pair) =>
  new ethers.Contract(pair.addr, uniswapPairAbi, web3Signer);
export const pairContractReadOnly = (pair) =>
  new web3.eth.Contract(uniswapPairAbi, pair.addr);

export const uniswapRouterContract = () =>
  new ethers.Contract(UNISWAP_V2_ROUTER, uniswapRouterAbi, web3Signer);

export const curveContract = () =>
  new ethers.Contract(CURVE.addr, curveMetaPoolAbi, web3Signer);

export const beanCrv3ContractReadOnly = () =>
  new web3.eth.Contract(curveMetaPoolAbi, CURVE.addr);

export const curveContractReadOnly = () =>
  new web3.eth.Contract(curveMetaPoolAbi, CURVE.factory);

async function initializeMetaMaskListeners() {
  const changeHandler = () => {
    window.location.replace(window.location.origin);
  };
  ethereum.on('accountsChanged', changeHandler);
  ethereum.on('chainChanged', changeHandler);
}

const walletConnect = walletConnectModule({
  qrcodeModalOptions: {
    mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
  }
})

export async function initialize(): Promise<boolean> {
  const injected = injectedModule()
  const onboard = Onboard({
    wallets: [injected, walletConnect],
    chains: [
      {
        id: '0x1',
        token: 'ETH',
        label: 'Ethereum Mainnet',
        rpcUrl: MAINNET_RPC_URL
      }
    ],
    appMetadata: {
      name: 'My App',
      icon: '<SVG_ICON_STRING>',
      description: 'My app using Onboard'
    }
  })

  const wallets = await onboard.connectWallet()

  web3 = new Web3(new Web3.providers.HttpProvider(MAINNET_RPC_URL));

  console.log(web3)
  account = wallets[0].accounts[0].address;

  web3Provider = new ethers.providers.Web3Provider(wallets[0].provider);
  web3Signer = web3Provider.getSigner();

  console.log(wallets)
  metamaskFailure = 1;
  return true;
}

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

/**
 * Defined as a function so we can update the "global" txCallback var
 * from outside of this file.
 */
export function initializeCallback(callback: Function) {
  txCallback = callback;
}

export async function isAddress(a) {
  return ethers.utils.isAddress(a);
}

export async function GetWalletAddress(): Promise<string | undefined> {
  await initializing;
  return account;
}
