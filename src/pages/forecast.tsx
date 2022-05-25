import { Card, Container, Stack } from '@mui/material';
import { ERC20Tokens } from 'constants/v2/tokens';
import useTokenMap from 'hooks/useTokenMap';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const ForecastPage : React.FC = () => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']>((state) => state._farmer);
  const tokens = useTokenMap(ERC20Tokens);

  return (
    <Container maxWidth="lg">
      <Stack direction="row">
        <Card>
          _farmer.silo<br />
          <pre>{JSON.stringify({ ...farmerSilo, events: null }, null, 2)}</pre>
        </Card>
        <Card>
          useTokenMap(AllTokens)<br />
          <pre>{JSON.stringify(tokens, null, 2)}</pre>
        </Card>
      </Stack>
    </Container>
  );
};

export default ForecastPage;
