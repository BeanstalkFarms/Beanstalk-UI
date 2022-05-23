import { Card, Container, Stack } from '@mui/material';
import { ERC20Tokens } from 'constants/v2/tokens';
import useTokenList from 'hooks/useTokenList';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const ForecastPage : React.FC = () => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const tokens = useTokenList(ERC20Tokens);

  return (
    <Container maxWidth="lg">
      <Stack direction="row">
        <Card>
          _farmer.silo<br />
          <pre>{JSON.stringify(farmerSilo, null, 2)}</pre>
        </Card>
        <Card>
          useTokenList(AllTokens)<br />
          <pre>{JSON.stringify(tokens, null, 2)}</pre>
        </Card>
      </Stack>
    </Container>
  );
};

export default ForecastPage;
