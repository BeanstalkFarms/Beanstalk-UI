import { useMemo } from 'react';
import { displayBN, displayFullBN } from '~/util';
import useHarvestableIndex from '../../beanstalk/useHarvestableIndex';
import { FarmerMarketItem } from './useFarmerMarket';

const openStates = ['ACTIVE', 'FILLED_PARTIAL'];

const isListing = (i: FarmerMarketItem) => i.type === 'listing' && i.listing;
const isOrder = (i: FarmerMarketItem) => i.type === 'order' && i.order;

export default function useFarmerMarketItemStats(
  item: FarmerMarketItem | undefined | null
) {
  const harvestableIndex = useHarvestableIndex();
  const data = useMemo(() => {
    if (
      !item ||
      (item.type === 'listing' && !item.listing) ||
      (item.type === 'order' && !item.order)
    ) {
      return undefined;
    }

    const items: { label: string; info: string }[] = [];
    items.push({
      label: 'ACTION',
      info: item.action.toUpperCase(),
    });
    items.push({
      label: 'TYPE',
      info: item.type.toUpperCase(),
    });
    items.push({
      label: 'PRICE TYPE',
      info: item.priceType.toUpperCase(),
    });
    items.push({
      label: 'PRICE',
      info: displayFullBN(item.pricePerPod, 2, 2),
    });
    if (isListing(item)) {
      items.push({
        label: 'AMOUNT',
        info: `${displayBN(item.remainingAmount)} PODS`,
      });
    }
    items.push({
      label: 'PLACE IN LINE',
      info: `${isOrder(item) ? '0 - ' : ''}${displayBN(
        item.placeInPodline
      )} PODS`,
    });
    if (isListing(item)) {
      const expiry = item.listing?.maxHarvestableIndex.minus(harvestableIndex);
      items.push({
        label: 'EXPIRY',
        info: expiry?.gt(0) ? expiry.toString() : 'N/A',
      });
    }
    items.push({
      label: '% FILLED',
      info: item.fillPct.isNaN() ? '-%' : `${displayFullBN(item.fillPct, 2)}%`,
    });
    items.push({
      label: 'TOTAL',
      info: `${displayFullBN(item.totalBeans, 2)} BEAN`,
    });
    items.push({
      label: 'STATUS',
      info: item.status,
    });

    return items;
  }, [harvestableIndex, item]);

  const isCancellable = useMemo(() => {
    if (!item) return false;
    if (isOrder(item)) {
      return openStates.includes(item.status);
    }
    if (isListing(item)) {
      return openStates.includes(item.status);
    }
    return false;
  }, [item]);

  return {
    data,
    isCancellable,
    openStates,
  };
}
