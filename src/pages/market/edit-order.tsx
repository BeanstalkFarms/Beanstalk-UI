import React from 'react';
import {
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { mockPodOrderData } from '../../components/Market/Plots.mock';
import OrderDetails from '../../components/Market/Cards/OrderDetails';
import { AppState } from '../../state';
import AddressIcon from '../../components/Common/AddressIcon';
import { getAccount } from '../../util/Account';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const EditOrderPage: React.FC = () => {
  // index of plot
  // eslint-disable-next-line
  const { id } = useParams<{ id: string }>();
  const { data: account } = useAccount();

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

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
              <Typography variant="h2">{`${getAccount(account.address).substring(0, 7)}...'s Pod Order`}</Typography>
            </Stack>
          )}
          returnPath="/market/account"
        />
        <OrderDetails podListing={mockPodOrderData[0]} harvestableIndex={beanstalkField.harvestableIndex} />
      </Stack>
    </Container>
  );
};

export default EditOrderPage;
