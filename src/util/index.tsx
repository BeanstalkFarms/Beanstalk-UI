import Web3 from 'web3';
import { provider as Web3CoreProvider } from 'web3-core';
import { ethers } from 'ethers';
import {
  BEANFTCOLLECTION,
  BEANFTGENESIS,
  BEANSTALK,
  CURVE,
  PRICE,
  UNISWAP_V2_ROUTER,
  SupportedToken,
  changeTheme,
} from 'constants/index';
import {
  BEAN, changeTokenAddresses
} from 'constants/tokens';
import { Token as SupportedV2Token } from 'classes';
import { CHAIN_IDS_TO_NAMES, SupportedChainId } from 'constants/chains';
// import { INFURA_HTTPS_URLS, INFURA_WS_URLS } from 'constants/rpc/infura';
import { ALCHEMY_HTTPS_URLS, ALCHEMY_WS_URLS } from 'constants/rpc/alchemy';
import onboard from './onboard';

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

export let initializing;
/** txCallback is called after each successful request to the chain. */
export let txCallback : Function | undefined;
export let web3 : Web3;
export let web3Ws : Web3;
export let account : string;
export let metamaskFailure = -1;
export let chainId : SupportedChainId = 1;

export let web3Provider : ethers.providers.Web3Provider;
export let web3Signer   : ethers.providers.JsonRpcSigner;

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
export const beanstalkContractReadOnlyWs = () =>
  new web3Ws.eth.Contract(beanstalkAbi, BEANSTALK);

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
export const pairContractReadOnlyWs = (pair: SupportedToken) =>
  new web3Ws.eth.Contract(uniswapPairAbi, pair.addr);

export const uniswapRouterContract = () =>
  new ethers.Contract(UNISWAP_V2_ROUTER, uniswapRouterAbi, web3Signer);

export const curveContract = () =>
  new ethers.Contract(CURVE.addr, curveMetaPoolAbi, web3Signer);

export const beanCrv3ContractReadOnly = () =>
  new web3.eth.Contract(curveMetaPoolAbi, CURVE.addr);

export const curveContractReadOnly = () =>
  new web3.eth.Contract(curveMetaPoolAbi, CURVE.factory);

/**
 * Listen for events emitted by the current provider.
 */
async function initWalletListeners() {
  if (!onboard) throw new Error('Onboard is not yet initialized.');
  const currentState = onboard.state.get();
  const provider = currentState.wallets[0].provider;

  // When changing account or chain, refresh the page.
  const changeHandler = () => {
    window.location.replace(window.location.origin);
  };
  provider.on('accountsChanged', changeHandler);
  provider.on('chainChanged', changeHandler);
}

/**
 *
 * @param _chainId
 * @returns
 */
export function getRpcEndpoint(_chainId: SupportedChainId) {
  return [
    ALCHEMY_HTTPS_URLS[_chainId],
    ALCHEMY_WS_URLS[_chainId],
  ];
}

/**
 * Switch our RPC endpoint
 * @param _chainId
 */
export async function switchChain(_chainId: SupportedChainId) {
  if (!onboard) throw new Error('Onboard is not yet initialized.');
  const currentState = onboard.state.get();

  // Update chain information, tokens, theme
  chainId = _chainId;
  changeTokenAddresses(chainId);
  if (chainId === 1) changeTheme('spring');
  if (chainId === 3) changeTheme('ropsten');

  // Create web3 / ethers instances.
  const [rpcHttp, rpcWs] = getRpcEndpoint(chainId);
  
  console.log(`Using wallet: ${currentState.wallets[0]?.label}`);
  if (currentState.wallets[0].label === 'MetaMask') {
    web3   = new Web3((currentState.wallets[0].provider as unknown) as Web3CoreProvider);
    web3Ws = web3;
    web3Provider = new ethers.providers.Web3Provider(
      currentState.wallets[0].provider,   // the provider instance from web3-onboard
      CHAIN_IDS_TO_NAMES[chainId],        // "mainnet" or "ropsten"
    );
    web3Signer = web3Provider.getSigner();
  } else {
    web3 = new Web3(
      new Web3.providers.HttpProvider(rpcHttp)
    );
    web3Ws = new Web3(
      new Web3.providers.WebsocketProvider(rpcWs)
    );
    web3Provider = new ethers.providers.Web3Provider(
      currentState.wallets[0].provider,   // the provider instance from web3-onboard
      CHAIN_IDS_TO_NAMES[chainId],        // "mainnet" or "ropsten"
    );
    web3Signer = web3Provider.getSigner();
  }
}

function getPreviouslyConnectedWallets() : null | string[] {
  return JSON.parse(
    window.localStorage.getItem('connectedWallets') || 'null',
  );
}

/**
 *
 */
export async function initialize(): Promise<boolean> {
  if (!onboard) {
    console.warn('initialize: missing onboard instance');
    return false;
  }

  // Setup wallet change listener
  const walletsSub = onboard.state.select('wallets');
  walletsSub.subscribe((wallets) => {
    const connectedWallets = wallets.map(({ label }) => label);
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWallets)
    );
  });

  // Check if we've previously connected a wallet.
  const previouslyConnectedWallets = getPreviouslyConnectedWallets();

  // Request a wallet connection.
  const wallets = await onboard.connectWallet({
    autoSelect: (previouslyConnectedWallets && previouslyConnectedWallets[0])
      ? {
        label: previouslyConnectedWallets[0],
        disableModals: true,
      }
      : undefined,
  });

  if (!wallets || wallets.length === 0) {
    console.log('No wallets found.');
    metamaskFailure = 2;
    return false;
  }

  // Convert the hex chain ID returned by web3-onboard
  // into our decimal format. Switch
  const chainHexId = wallets[0].chains[0].id;
  chainId = parseInt(chainHexId, 16);
  switchChain(chainId);

  // NOTE: the toLowerCase() is important here. Need to make sure
  // that any location that uses an address is lower-cased (the PlotTransfer
  // event is an example). Some wallets see,m to return lowercased address, some don't.
  account = wallets[0].accounts[0].address.toLowerCase();

  // Listen for events emitted by the wallet provider.
  initWalletListeners();

  //
  if (account === undefined) {
    console.log('initialize: account = undefined');
    metamaskFailure = 2;
    return false;
  }

  // console.log(`initialize: ${account}`);

  return true;
}

export async function disconnect() {
  if (!onboard) throw new Error('Onboard is not yet initialized.');
  const state = onboard.state.get();
  window.localStorage.removeItem('connectedWallets');
  await onboard.disconnectWallet({
    label: state.wallets[0].label,
  });
  window.location.reload();
}

/**
 *
 */
export async function switchToMainnet() {
  if (!onboard) throw new Error('Onboard is not yet initialized.');
  return onboard.setChain({ chainId: '0x1' });
}

/**
 *
 */
export async function watchToken() {
  if (!onboard) throw new Error('Onboard is not yet initialized.');
  const currentState = onboard.state.get();
  const provider = currentState.wallets[0].provider;

  return provider.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',              // Initially only supports ERC20, but eventually more!
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

export async function getWalletAddress(): Promise<string | undefined> {
  await initializing;
  return account;
}
