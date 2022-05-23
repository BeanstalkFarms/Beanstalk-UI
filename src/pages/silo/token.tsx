import React from 'react';
import { useParams, Link as RouterLink  } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Deposit from 'components/SiloV2/Actions/Deposit';
import Deposits from 'components/SiloV2/Deposits';
import useWhitelist from 'hooks/useWhitelist';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const TokenPage : React.FC<{}> = () => {
  const { address } = useParams<{ address: string }>();
  const silo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  // const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const whitelist = useWhitelist();

  if (!whitelist || !address || !whitelist[address]) return (<div>Not found</div>);

  const token = whitelist[address];
  const siloToken = silo.tokens[token.address];

  if (!token || !siloToken) return null;

  return (
    <Container maxWidth="sm">
      <Stack gap={2}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Box>
            <Button to={"/silo"} component={RouterLink} variant="contained" color="light" sx={{ p: 1, borderRadius: 100, minWidth: 0 }}>
              <ChevronLeftIcon />
            </Button>
          </Box>
          <Stack gap={0}>
            <Typography variant="h2">{token.name} Silo</Typography>
            <Typography>Deposit {token.name} to earn Stalk / Seed</Typography>
          </Stack>
        </Stack>
        <Deposit
          token={token}
        />
        <Deposits
          token={token}
          siloToken={siloToken}
        />
      </Stack>
    </Container>
  );
};

export default TokenPage;
