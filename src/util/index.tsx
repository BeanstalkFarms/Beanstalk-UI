// -----------------
// Exports
// -----------------

export * from './Account';
export * from './Chain';
export * from './Ledger';
export * from './Tokens';

// -----------------
// Helpers
// -----------------

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
