export const FIELD = 'field';
export const SILO = 'silo';
export const BARNRAISE = 'barnraise';
export const OTHER = 'other';

const mappedEvents = {
  // silo
  0: [
    'BeanClaim',
    'LPClaim',
    'BeanDeposit',
    'BeanRemove',
    'BeanWithdraw',
    'LPDeposit',
    'LPRemove',
    'LPWithdraw',
    'Deposit',
    'Withdraw'
  ],
  // field
  1: [
    'Harvest',
    'Sow',
    'PlotTransfer',
    'PodListingCancelled',
    'PodListingCreated',
    'PodListingFilled',
    'PodOrderCancelled',
    'PodOrderCreated',
    'PodOrderFilled'
  ]
};

export function getEventFacet(event: string | undefined) {
  if (event === undefined) {
    return OTHER;
  }
  if (mappedEvents[0].includes(event)) {
    return SILO;
  }
  if (mappedEvents[1].includes(event)) {
    return FIELD;
  }
  return OTHER;
}
