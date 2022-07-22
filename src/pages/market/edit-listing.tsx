import React from 'react';
import {
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import PlotListingDetails from '../../components/Market/Cards/PlotListingDetails';
import { mockPodListingData } from '../../components/Market/Plots.mock';
import AddressIcon from '../../components/Common/AddressIcon';
import { getAccount } from '../../util/Account';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const EditListingPage: React.FC = () => {
  // index of plot
  // eslint-disable-next-line
  const { id } = useParams<{ id: string }>();
  const { data: account } = useAccount();

  if (!account?.address) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={account.address} />
              <Typography variant="h2">{`${getAccount(account.address).substring(0, 7)}...'s Pod Listing`}</Typography>
            </Stack>
          )}
          returnPath="/market/account"
        />
        <PlotListingDetails podListing={mockPodListingData[0]} harvestableIndex={mockPodListingData[0].index} />
      </Stack>
    </Container>
  );
};

export default EditListingPage;
