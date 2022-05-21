import { ethers } from 'ethers';

import { changeTheme, BEANSTALK, BEANFTCOLLECTION, BEANFTGENESIS, UNISWAP_V2_ROUTER } from 'constants/index';
import { changeTokenAddresses } from 'constants/tokens';
import { SupportedChainId } from 'constants/chains';
import { ALCHEMY_HTTPS_URLS } from 'constants/rpc/alchemy';
import { ERC20__factory } from 'constants/generated/factories/ERC20__factory';
import { BeaNFTGenesis__factory, BeanstalkPrice__factory, Beanstalk__factory, UniswapV2Router__factory } from 'constants/generated';
import { BEANSTALK_PRICE_ADDRESSES } from 'constants/v2/addresses';
import client from './wagmi';

// -- Exports
// export * from './LedgerUtilities';
export * from './SeasonUtilities';
export * from './SiloUtilities';
export * from './CurveUtilities';
export * from './TokenUtilities';
export * from './TimeUtilities';
export * from './UniswapUtilities';
export * from './TimeUtilities';
// export * from './BeaNFTUtilities';
export * from './APYUtilities';
export * from './FundraiserUtilities';
export * from './MarketUtilities';
export type EventData = ethers.Event

// -- Globals
export let chainId : SupportedChainId = 1; // fixme
export const account = null;
export const PRIMARY_CHAIN_ID = SupportedChainId.RINKEBY;
export const RPC_HOST = ALCHEMY_HTTPS_URLS[PRIMARY_CHAIN_ID];
export const provider = new ethers.providers.JsonRpcProvider(RPC_HOST);

// -- Contracts 
export const erc20TokenContract = (address: string, signer?: ethers.Signer) =>
  ERC20__factory.connect(address, signer || client.provider);

export const beanstalkPriceContract = () =>
  BeanstalkPrice__factory.connect(BEANSTALK_PRICE_ADDRESSES[SupportedChainId.ROPSTEN], provider);

export const beanstalkContract = (signer?: ethers.Signer) => 
  Beanstalk__factory.connect(BEANSTALK, signer || client.provider);

export const beaNFTGenesisContract = (signer?: ethers.Signer) =>
  BeaNFTGenesis__factory.connect(BEANFTGENESIS, signer || client.provider);

export const beaNFTWinterContract = (signer?: ethers.Signer) =>
  BeaNFTGenesis__factory.connect(BEANFTCOLLECTION, signer || client.provider);

export const uniswapRouterContract = (signer?: ethers.Signer) =>
  UniswapV2Router__factory.connect(UNISWAP_V2_ROUTER, signer || client.provider);

// -- Helpers
export async function switchChain(_chainId: SupportedChainId) {
  // if (!web3Onboard) throw new Error('Onboard is not yet initialized.');

  // await web3Onboard.setChain({
  //   chainId: `0x${_chainId.toString(16)}`,
  // });

  // Update chain information, tokens, theme
  chainId = _chainId;
  changeTokenAddresses(chainId);
  if (chainId === 1) changeTheme('spring');
  if (chainId === 3) changeTheme('ropsten');
}

export function getPreviouslyConnectedWallets() : null | string[] {
  return JSON.parse(
    window.localStorage.getItem('connectedWallets') || 'null',
  );
}

export function trimAddress(address: string) {
  return `${address.substring(0, 6)}..${address.slice(-4)}`;
}

const ordinalRulesEN = new Intl.PluralRules('en', { type: 'ordinal' });
const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th'
};

export function ordinal(number: number) : string {
  const category = ordinalRulesEN.select(number);
  const suffix = suffixes[category];
  return (number + suffix);
}
