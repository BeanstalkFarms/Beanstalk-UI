/* eslint-disable */
import {Container} from '@mui/system';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import {Card, Grid, Stack, Tab, Tabs, Typography} from "@mui/material";
import {FIELD, OTHER, SILO} from "util/GetEventFacet";
import {ParsedEvent} from "state/farmer/events/updater";
import EventItem from "components/History/EventItem";
import { useAccount } from 'wagmi';
import WalletButton from "components/Common/Connection/WalletButton";

const mappedTabs = {
  0: SILO,
  1: FIELD,
  2: OTHER
}

const TransactionHistoryPage: React.FC = () => {
  const { data: account } = useAccount();
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  const [walletEvents, setWalletEvents] = useState<ParsedEvent[]>();

  const handleSetTab = (event: React.SyntheticEvent, newValue: 0 | 1 | 2) => setTab(newValue);

  useEffect(() => {
    function filterEventsByFacet(facet: string) {
      return events.filter((event) => {
        return event.facet === facet;
      })
    }
    setWalletEvents(filterEventsByFacet(mappedTabs[tab]));
  }, [events, tab])

  if (!account) {
    return (
      <Card component={Stack} direction="row" alignItems="center" justifyContent="center" sx={{ p: 4 }}>
        <WalletButton variant="outlined" color="primary" />
      </Card>
    )
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <Card sx={{border: "none", p: 2}}>
          <Stack gap={0.5}>
            <Tabs value={tab} onChange={handleSetTab} sx={{ minHeight: 0 }}>
              <Tab label="Silo" />
              <Tab label="Field" />
              <Tab label="Other" />
            </Tabs>
            {walletEvents !== undefined && walletEvents.length > 1 ? (
              <Grid container>
                {walletEvents.map((event) => {
                  return (
                    <Grid item width="100%">
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
