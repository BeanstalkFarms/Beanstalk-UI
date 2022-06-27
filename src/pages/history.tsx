/* eslint-disable */
import {Container} from '@mui/system';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import {Card, Grid, Stack, Tab, Tabs, Typography} from "@mui/material";
import {FIELD, OTHER, SILO} from "util/GetEventFacet";
import EventItem from "components/History/EventItem";
import { useAccount } from 'wagmi';
import WalletButton from "components/Common/Connection/WalletButton";
import { Event } from 'lib/Beanstalk/EventProcessor';

const facetByTabIndex = {
  0: undefined,
  1: SILO,
  2: FIELD,
  3: OTHER
}

const TransactionHistoryPage: React.FC = () => {
  const { data: account } = useAccount();
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  const [walletEvents, setWalletEvents] = useState<Event[]>();

  const handleSetTab = (event: React.SyntheticEvent, newValue: 0 | 1 | 2) => setTab(newValue);

  useEffect(() => {
    function filterEventsByFacet(facet: string | undefined) {
      const e = Array.from(events).reverse();
      if (facet) {
        return e.filter((event) => {
          return event.facet === facet;
        })
      }
      return e
    
    }
    setWalletEvents(filterEventsByFacet(facetByTabIndex[tab]));
  }, [events, tab])

  if (!account) {
    return (
      <Card component={Stack} direction="row" alignItems="center" justifyContent="center" sx={{ p: 4 }}>
        <WalletButton variant="outlined" color="primary" />
      </Card>
    )
  }

  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <Card sx={{border: "none", p: 2}}>
          <Stack gap={0.5}>
            <Tabs value={tab} onChange={handleSetTab} sx={{ minHeight: 0 }}>
              <Tab label="All" />
              <Tab label="Silo" />
              <Tab label="Field" />
              <Tab label="Other" />
            </Tabs>
            {walletEvents !== undefined && walletEvents.length > 1 ? (
              <Grid container>
                {walletEvents.map((event) => {
                  return (
                    <Grid key={`${event.transactionHash}-${event.logIndex}`} item width="100%">
                      <EventItem
                        event={event}
                        account={account?.address ? account.address.toString().toLowerCase(): ""}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Stack direction="column" justifyContent="center" alignItems="center" height="250px" gap={1}>
                <Typography variant="h3">No events of this type!</Typography>
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default TransactionHistoryPage;
