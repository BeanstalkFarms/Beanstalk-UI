import Web3 from 'web3';
import { provider, HttpProvider } from 'web3-core';
import { ethers } from 'ethers';
import {
  BEANFTCOLLECTION,
  BEANFTGENESIS,
  BEANSTALK,
  CURVE,
  PRICE,
  UNISWAP_V2_ROUTER,
  changeNetwork,
  SupportedToken,
} from 'constants/index';
import { Token as SupportedV2Token } from 'classes';

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

// FIXME
let ethereum : any;
export let initializing : boolean;
/** txCallback is called after each successful request to the chain. */
export let txCallback : () => any;
export let web3 : Web3;
export let account : string;
export let metamaskFailure = -1;
export let chainId = 1;

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

async function initializeMetaMaskListeners() {
  const changeHandler = () => {
    window.location.replace(window.location.origin);
  };
  ethereum.on('accountsChanged', changeHandler);
  ethereum.on('chainChanged', changeHandler);
}

export async function initialize(): Promise<boolean> {
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
        const [
          hexAccount,
          chainIdentifier
        ] = await Promise.all([
          web3Signer.getAddress(),
          web3Signer.getChainId(),
        ]);
        account = hexAccount;
        chainId = chainIdentifier;
        if (chainId !== 1 && chainId !== 3 && chainId !== 1337) {
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
