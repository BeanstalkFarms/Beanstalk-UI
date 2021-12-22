import Web3 from 'web3';
import { ethers } from 'ethers';
import { BEANFT, BEANSTALK, UNISWAP_V2_ROUTER } from 'constants/index';

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
export * from './FundraiserUtilities';

export let initializing;
export let web3: Web3;
export let txCallback = null;
export const metamaskFailure = -1;
export const chainId = 1;

const beanAbi = require('../constants/abi/Bean.json');
const beanstalkAbi = require('../constants/abi/Beanstalk.json');
const beaNFTAbi = require('../constants/abi/BeaNFT.json');
const uniswapPairAbi = require('../constants/abi/UniswapV2Pair.json');
const uniswapRouterAbi = require('../constants/abi/UniswapV2Router02.json');

export const tokenContract = (token, signer) =>
  new ethers.Contract(token.addr, beanAbi, signer);

export const tokenContractReadOnly = (token, web3) =>
  new web3.eth.Contract(beanAbi, token.addr);

export const beanstalkContract = (signer) =>
  new ethers.Contract(BEANSTALK.addr, beanstalkAbi, signer);

export const beanstalkContractReadOnly = (web3) =>
  new web3.eth.Contract(beanstalkAbi, BEANSTALK.addr);

export const beaNFTContract = (signer) =>
  new ethers.Contract(BEANFT.addr, beaNFTAbi, signer);
export const beaNFTContractReadOnly = (web3) =>
  new web3.eth.Contract(beaNFTAbi, BEANFT.addr);

export const pairContract = (pair, signer) =>
  new ethers.Contract(pair.addr, uniswapPairAbi, signer);
export const pairContractReadOnly = (pair, web3) =>
  new web3.eth.Contract(uniswapPairAbi, pair.addr);

export const uniswapRouterContract = (signer) =>
  new ethers.Contract(UNISWAP_V2_ROUTER, uniswapRouterAbi, signer);

export async function switchToMainnet(ethereum) {
  await ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x1' }],
  });
  window.location.reload();
}

export function initializeCallback(callback) {
  txCallback = callback;
}

export async function isAddress(a) {
  return ethers.utils.isAddress(a);
}
