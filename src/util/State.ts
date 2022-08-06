import { ethers } from 'ethers';
import { EventCacheName, FarmerEvents } from '~/state/farmer/events2';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.warn('Failed to load state');
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    // pass
    console.warn('Failed to save state');
  }
};

export const getEventCacheId = (
  chainId: number,
  account: string,
  cacheId: EventCacheName
) => `${chainId}-${account.toLowerCase()}-${cacheId}`;

export const rehydrateEvents2 = (events2: FarmerEvents | undefined) => {
  try {
    if (!events2) return;
    const cache = { ...events2 };
    Object.keys(cache).forEach((key) => {
      if (cache[key].events?.length > 0) {
        cache[key].events = cache[key].events.map((event) => ({
            ...event,
            args: event.args?.map((arg: any) => {
              if (typeof arg === 'object' && arg.type === 'BigNumber') {
                return ethers.BigNumber.from(arg.hex);
              }
              return arg;
            }) || [],
          }));
      }
    });
    return cache;
  } catch (err) {
    console.error(err);
    return {}; //
  }
};
