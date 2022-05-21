import { useCallback, useEffect } from 'react';
import { useBeanstalkContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import flatten from 'lodash/flatten'
import useBlocks from 'hooks/useBlocks';
import { setEvents } from './actions';
import { useDispatch } from 'react-redux';


export default function FarmerUpdater() {
  const beanstalk = useBeanstalkContract();
  const { data: account } = useAccount();
  const blocks = useBlocks();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if(beanstalk && account) {
      console.debug('[farmer/updater] fetching events');
      Promise.all([
        beanstalk.queryFilter(
          beanstalk.filters.BeanDeposit(account.address),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
        beanstalk.queryFilter(
          beanstalk.filters['BeanRemove(address,uint32[],uint256[],uint256)'](account.address),
          blocks.BEANSTALK_GENESIS_BLOCK
        ),
      ] as const).then((results) => {
        const allEvents = flatten(results).sort((a, b) => {
          const diff = a.blockNumber - b.blockNumber;
          if (diff !== 0) return diff;
          return a.logIndex - b.logIndex;
        });
        console.debug(`[farmer/updater] allEvents`, allEvents)
        dispatch(setEvents(allEvents));
      })
    }
  }, [
    account,
    beanstalk,
    blocks.BEANSTALK_GENESIS_BLOCK,
    dispatch
  ]);

  return null;
}

// const accountEvents = await Promise.all([
//   beanstalk.getPastEvents('BeanDeposit', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('BeanRemove', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('BeanWithdraw', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('LPDeposit', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('LPRemove', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('LPWithdraw', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('Deposit', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('RemoveSeason', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('RemoveSeasons', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('Withdraw', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('ClaimSeason', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('ClaimSeasons', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('Sow', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('Harvest', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('BeanClaim', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('LPClaim', {
//     filter: { account: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('PlotTransfer', {
//     filter: { from: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   beanstalk.getPastEvents('PlotTransfer', {
//     filter: { to: account },
//     fromBlock: BEANSTALK_GENESIS_BLOCK,
//   }),
//   // Farmer's Market
//   beanstalk.getPastEvents('PodListingCreated', {
//     filter: { account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodListingCancelled', {
//     filter: { account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodListingFilled', {
//     filter: { from: account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodListingFilled', {
//     filter: { to: account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodOrderCreated', {
//     filter: { account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodOrderCancelled', {
//     filter: { account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodOrderFilled', {
//     filter: { from: account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   }),
//   beanstalk.getPastEvents('PodOrderFilled', {
//     filter: { to: account },
//     fromBlock: BIP10_COMMITTED_BLOCK,
//   })
// ]).catch((err) => {
//   console.error('initializeEventListener: failed to fetch accountEvents', err);
//   throw err;
// });