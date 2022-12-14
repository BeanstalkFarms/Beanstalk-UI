import { Stack } from '@mui/material';
import React from 'react';
import { FarmerMarketItem } from '~/hooks/farmer/useFarmerMarket';
import InfoRow from '~/components/Common/Form/InfoRow';
import { displayFullBN } from '~/util';

type IOrderDetails = {
  item: FarmerMarketItem;
};

const OrderDetailsContent: React.FC<IOrderDetails> = ({ item }) => {
  const infoProps = {
    ACTION: item.action.toUpperCase(),
    TYPE: item.type.toUpperCase(),
    'PRICE TYPE': item.priceType.toUpperCase(),
    PRICE: displayFullBN(item.pricePerPod, 2),
    'PLACE IN LINE': `${displayFullBN(item.placeInPodline, 2)}`,
    '% FILLED': item.fillPct.toFixed(2),
    TOTAL: `${displayFullBN(item.totalBeans, 2)}`,
  };

  return (
    <Stack>
      {Object.entries(infoProps).map(([label, value]) => (
        <InfoRow
          key={label}
          label={label}
          labelColor="text.primary"
          infoColor="text.secondary"
        >
          {value}
        </InfoRow>
      ))}
    </Stack>
  );
};

export default OrderDetailsContent;
