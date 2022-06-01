import { ethers } from 'ethers';

// -- Exports
export * from './TokenUtilities';
export type EventData = ethers.Event

// -- Globals

export function getPreviouslyConnectedWallets() : null | string[] {
  return JSON.parse(
    window.localStorage.getItem('connectedWallets') || 'null',
  );
}

export function trimAddress(address: string, showSuffix : boolean = true) {
  return `${address.substring(0, 6)}${showSuffix ? `..${address.slice(-4)}` : ''}`;
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
