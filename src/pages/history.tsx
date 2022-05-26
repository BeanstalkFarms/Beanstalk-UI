/* eslint-disable */
import {Container} from '@mui/system';
import React from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import PageHeader from "../components/v2/Common/PageHeader";
import {Box, Button, Card, Divider, Grid, Stack, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";
import TransactionRow from "../components/v2/History/TransactionRow";

const buttonStyle = {
  cursor: "pointer",
  border: 1,
  pl: 1,
  pr: 1,
  pt: 0.5,
  pb: 0.5,
  borderRadius: "25px"
}

const TransactionHistoryPage: React.FC = () => {
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  return (
    <Container maxWidth="xl">
      Events ({events.length})
      <Stack gap={2}>
        <Card sx={{border: "none", pl: 2, pr: 2, pt: 3, pb: 2}}>
          <Stack gap={0.5}>
            <Stack>
              <Typography variant="h2">Transaction History</Typography>
              <Stack direction="row" gap={1}>
                <Box sx={{...buttonStyle}}>
                  <Typography>Silo</Typography>
                </Box>
                <Box sx={{...buttonStyle}}>
                  <Typography>Field</Typography>
                </Box>
                <Box sx={{...buttonStyle}}>
                  <Typography>Other</Typography>
                </Box>
              </Stack>
            </Stack>
            <Grid container>
              <TransactionRow title={"test"} />
              <TransactionRow title={"test"} />
              <TransactionRow title={"test"} />
              <TransactionRow title={"test"} />
              <TransactionRow title={"test"} />
            </Grid>
            <Box display="flex" justifyContent="right">
              <Typography>PAGE TAB</Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default TransactionHistoryPage;
