import Web3 from 'web3';
import { ethers } from 'ethers';
import {
  BEANFT,
  BEANSTALK,
  UNISWAP_V2_ROUTER,
  changeNetwork,
} from '../constants';

export * from './EventUtilities';
export * from './FieldUtilities';
export * from './GovernanceUtilities';
export * from './LedgerUtilities';
export * from './SeasonUtilities';
export * from './SiloUtilities';
export * from './TokenUtilities';
export * from './TimeUtilities';
export * from './UniswapUtilities';
export * from './TimeUtilities';
export * from './BeaNFTUtilities';
export * from './APYUtilities';
export * from './AnalyticsUtilities';

let ethereum;
export let initializing;
export let web3: Web3;
export let account: String;
export let txCallback = null;
export let metamaskFailure = -1;
export let chainId = 1;

export let web3Provider;
export let web3Signer;

const beanAbi = require('../constants/abi/Bean.json');
const beanstalkAbi = require('../constants/abi/Beanstalk.json');
const beaNFTAbi = require('../constants/abi/BeaNFT.json');
const uniswapPairAbi = require('../constants/abi/UniswapV2Pair.json');
const uniswapRouterAbi = require('../constants/abi/UniswapV2Router02.json');

export const tokenContract = (token) =>
  new ethers.Contract(token.addr, beanAbi, web3Signer);

export const tokenContractReadOnly = (token) =>
  new web3.eth.Contract(beanAbi, token.addr);

export const beanstalkContract = () =>
  new ethers.Contract(BEANSTALK.addr, beanstalkAbi, web3Signer);

export const beanstalkContractReadOnly = () =>
  new web3.eth.Contract(beanstalkAbi, BEANSTALK.addr);

export const beaNFTContract = () =>
  new ethers.Contract(BEANFT.addr, beaNFTAbi, web3Signer);
export const beaNFTContractReadOnly = () =>
  new web3.eth.Contract(beaNFTAbi, BEANFT.addr);

export const pairContract = (pair) =>
  new ethers.Contract(pair.addr, uniswapPairAbi, web3Signer);
export const pairContractReadOnly = (pair) =>
  new web3.eth.Contract(uniswapPairAbi, pair.addr);

export const uniswapRouterContract = () =>
  new ethers.Contract(UNISWAP_V2_ROUTER, uniswapRouterAbi, web3Signer);

async function initializeMetaMaskListeners() {
  const changeHandler = () => {
    window.location.reload();
  };
  ethereum.on('accountsChanged', changeHandler);
  ethereum.on('chainChanged', changeHandler);
}

export async function initialize(): Promise<void> {
  if (!ethereum) {
    try {
      ethereum = (window as any).ethereum;
      if (!ethereum) {
        metamaskFailure = 0;
        return false;
      }
      if (!ethereum.isMetaMask) {
        metamaskFailure = 1;
        return false;
      }
      ethereum.request({ method: 'eth_requestAccounts' });
      if (ethereum && web3 === undefined) {
        web3Provider = new ethers.providers.Web3Provider(ethereum);
        web3Signer = web3Provider.getSigner();

        web3 = new Web3(ethereum);
        initializeMetaMaskListeners();
        const [hexAccount, chainIdentifier] = await Promise.all([
          web3Signer.getAddress(),
          web3Signer.getChainId(),
        ]);
        account = hexAccount;
        chainId = parseInt(chainIdentifier, 10);
        if (chainId !== 1 && chainId !== 3) {
          metamaskFailure = 3;
          return false;
        }
        changeNetwork(chainId);
        if (account === undefined) {
          metamaskFailure = 2;
          return false;
        }
      }
    } catch (error) {
      console.log(error);
      metamaskFailure = 2;
      return false;
    }
    return true;
  }
  await initializing;
  return true;
}

export function initializeCallback(callback) {
  txCallback = callback;
}

export async function isAddress(a) {
  return ethers.utils.isAddress(a);
}

export async function GetWalletAddress(): Promise<String | undefined> {
  await initializing;
  return account;
}
