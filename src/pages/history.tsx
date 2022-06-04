/* eslint-disable */
import {Container} from '@mui/system';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import { useAccount } from 'wagmi';
import {Box, Card, Grid, Stack, Typography} from "@mui/material";
import {FIELD, OTHER, SILO} from "util/GetEventFacet";
import {ParsedEvent} from "state/v2/farmer/events/updater";
import EventItem from "components/v2/History/EventItem";
import WalletButton from 'components/v2/Common/Connection/WalletButton';

const buttonStyle = {
  cursor: "pointer",
}

const TransactionHistoryPage: React.FC = () => {
  const { data: account } = useAccount();
  const [currentTab, setCurrentTab] = useState(SILO.toString());
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  const [walletEvents, setWalletEvents] = useState<ParsedEvent[]>(filterEventsByFacet(currentTab));
  const handleSetTab = (tab: string) => setCurrentTab(tab);

  function filterEventsByFacet(tab: string) {
    return events.filter((event) => {
      return event.facet === tab;
    })
  }

  useEffect(() => {
    setWalletEvents(filterEventsByFacet(currentTab));
  }, [currentTab])

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
            <Stack gap={1}>
              <Stack direction="row" gap={1}>
                <Box sx={{...buttonStyle}} onClick={() => handleSetTab(SILO.toString())}>
                  <Typography
                    sx={{ fontSize: "17px"}}
                    color={currentTab === SILO.toString() ? "text.primary" : "text.secondary"}>Silo</Typography>
                </Box>
                <Box sx={{...buttonStyle}} onClick={() => handleSetTab(FIELD.toString())}>
                  <Typography
                    sx={{ fontSize: "17px"}}
                    color={currentTab === FIELD.toString() ? "text.primary" : "text.secondary"}>Field</Typography>
                </Box>
                <Box sx={{...buttonStyle}} onClick={() => handleSetTab(OTHER.toString())}>
                  <Typography
                    sx={{ fontSize: "17px"}}
                    color={currentTab === OTHER.toString() ? "text.primary" : "text.secondary"}>Other</Typography>
                </Box>
              </Stack>
            </Stack>
            {walletEvents.length > 1 ? (
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
