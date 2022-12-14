import { Stack } from '@mui/material';
import React from 'react';
import InfoRow from '~/components/Common/Form/InfoRow';
import { FarmerMarketItem } from '~/hooks/farmer/useFarmerMarket';

const ListingDetailsContent: React.FC<{
  item: FarmerMarketItem;
}> = ({ item }) => {
  const infoProps = {
    ACTION: item.action.toUpperCase(),
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

export default ListingDetailsContent;
