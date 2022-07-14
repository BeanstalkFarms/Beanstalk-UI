import React from 'react';
import {
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';

import { useTheme } from '@mui/material/styles';
import MyPlots from 'components/Market/MyPlots';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useChainId from 'hooks/useChain';
import { useAccount } from 'wagmi';
import { SupportedChainId } from '../../constants';
import { getAccount } from '../../util/Account';
import AddressIcon from '../../components/Common/AddressIcon';
import CreateButtons from '../../components/Market/CreateButtons';

const MarketAccountPage: React.FC = () => {
  const { data: account } = useAccount();
  const chainId = useChainId();

  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = (
      <ComingSoonCard title="Pod Market" />
    );
  } else {
    content = (<MyPlots />);
  }

  if (!account?.address) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={account.address} />
              <Typography variant="h1">{`${getAccount(account.address).substring(0, 7)}...`}</Typography>
            </Stack>
          )}
          description="Browse my open Pod Orders and Listings"
          control={<CreateButtons />}
        />
        {content}
      </Stack>
    </Container>
  );
};
export default MarketAccountPage;
