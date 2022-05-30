import React from 'react';
import { Button, Card, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from 'components/v2/Common/PageHeader';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import duneIcon from 'img/dune-icon.svg';
// import activeFert from 'img/icon/fertilizer/active.svg';
import forecast from 'img/Forecast.svg';

const ForecastPage : React.FC = () => (
  <Container maxWidth="md">
    <Stack gap={2}>
      <PageHeader
        title={<strong>Forecast</strong>}
        description="View conditions on the Bean Farm"
      />
      <Card sx={{ px: 4, py: 6 }}>
        <Stack direction="column" alignItems="center" justifyContent="center" gap={4}>
          <img src={forecast} alt="Barn" style={{ maxWidth: 400 }} />
          <Typography variant="h1">The Forecast page is coming soon</Typography>
          <Stack direction="column" gap={2}>
            <Button
              component={RouterLink}
              to="/barn-raise"
              color="primary"
              variant="outlined"
              size="large"
              // startIcon={<img src={activeFert} alt="Dune" style={{ height: 18 }} />}
              // endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
              sx={{ px: 4 }}
            >
              Support the Barn Raise
            </Button>
            <Button
              href="https://dune.xyz/tbiq/Beanstalk"
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              size="small"
              // startIcon={<img src={duneIcon} alt="Dune" style={{ height: 18 }} />}
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              Analytics
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  </Container>
);

export default ForecastPage;
