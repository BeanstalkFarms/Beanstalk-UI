/* eslint-disable */
import {Container} from '@mui/system';
import React from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import PageHeader from "../components/v2/Common/PageHeader";
import {Box, Button, Card, Divider, Grid, Stack, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";
import TransactionRow from "../components/v2/History/TransactionRow";
import ButtonFilters from "../components/v2/History/ButtonFilters";
import TransactionGrid from "../components/v2/History/TransactionGrid";

const TransactionHistoryPage: React.FC = () => {
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  return (
    <Container maxWidth="lg">
      {/*Events ({events.length})*/}
      <Stack gap={2}>
        <Card sx={{border: "none", p: 2}}>
          <Stack gap={0.5}>
            <Stack gap={1}>
              <Typography variant="h2">Transaction History</Typography>
              <ButtonFilters title={"test"} />
            </Stack>
            <TransactionGrid title={"test"} />
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
