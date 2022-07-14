import { ethers } from 'ethers';

// -----------------
// Exports
// -----------------

export * from './Account';
export * from './Chain';
export * from './Ledger';
export * from './Tokens';
export type EventData = ethers.Event

// -----------------
// Helpers
// -----------------

export function trimAddress(address: string, showSuffix : boolean = true) {
  return `${address.substring(0, 6)}${showSuffix ? `..${address.slice(-4)}` : ''}`;
}

const ordinalRulesEN = new Intl.PluralRules('en', { type: 'ordinal' });
const suffixes : { [k: string] : string } = {
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
