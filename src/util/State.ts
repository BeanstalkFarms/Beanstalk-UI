import { EventCacheName } from 'state/farmer/events2';

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
