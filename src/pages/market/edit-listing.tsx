import React from 'react';
import {
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import PlotListingDetails from '../../components/Market/Cards/PlotListingDetails';
import { mockPodListingData } from '../../components/Market/Plots.mock';
import AddressIcon from '../../components/Common/AddressIcon';
import { getAccount } from '../../util/Account';
import CancelButton from '../../components/Market/CancelButton';

const EditListingPage: React.FC = () => {
  // index of plot
  const { id } = useParams<{ id: string }>();
  const { data: account } = useAccount();

  if (!account?.address) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={account.address} />
              <Typography variant="h1">{`${getAccount(account.address).substring(0, 7)}...'s Pod Listing`}</Typography>
            </Stack>
          )}
          returnPath="/market/account"
          control={<CancelButton buttonText="Cancel Listing" onClick={() => {}} />} // FIXME
        />
        <PlotListingDetails podListing={mockPodListingData[0]} harvestableIndex={mockPodListingData[0].index} />
      </Stack>
    </Container>
  );
};
export default EditListingPage;
