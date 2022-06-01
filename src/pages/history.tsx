/* eslint-disable */
import {Container} from '@mui/system';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import {Box, Card, Divider, Grid, Stack, Typography} from "@mui/material";
import {account, displayBN, toTokenUnitsBN} from "../util";
import {FIELD, OTHER, SILO} from "../util/GetEventFacet";
import {ParsedEvent} from "../state/v2/farmer/events/updater";
import WalletEvent from "../components/Navigation/WalletEvent";
import BigNumber from "bignumber.js";
import {BEAN, ETH, UNI_V2_ETH_BEAN_LP, WITHDRAWAL_FROZEN} from "../constants";
import {
  ClaimableAsset,
  CryptoAsset,
  FarmAsset,
  SiloAsset,
  TokenTypeImageModule,
  TransitAsset
} from "../components/Common";
import {PodListingFilledEvent, PodOrderFilledEvent} from "../state/marketplace/updater";
import EventItem from "../components/v2/History/EventItem";

const buttonStyle = {
  cursor: "pointer",
}

const TransactionHistoryPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(SILO)
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  const [walletEvents, setWalletEvents] = useState<ParsedEvent[]>([]);
  const handleSetTab = (tab: string) => setCurrentTab(tab);

  function filterEventsByFacet() {
    const filteredEvents = events.filter((event) => {
      return event.facet === currentTab;
    })
    setWalletEvents(filteredEvents);
  }

  useEffect(() => {
    filterEventsByFacet();
  }, [currentTab])

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <Card sx={{border: "none", p: 2}}>
          <Stack gap={0.5}>
            <Stack gap={1}>
              <Stack direction="row" gap={1.5}>
                <Box sx={{...buttonStyle}} onClick={() => handleSetTab(SILO.toString())}>
                  <Typography
                    variant="h2"
                    color={currentTab === SILO.toString() ? "text.primary" : "text.secondary"}>Silo</Typography>
                </Box>
                <Box sx={{...buttonStyle}} onClick={() => handleSetTab(FIELD.toString())}>
                  <Typography
                    variant="h2"
                    color={currentTab === FIELD.toString() ? "text.primary" : "text.secondary"}>Field</Typography>
                </Box>
                <Box sx={{...buttonStyle}} onClick={() => handleSetTab(OTHER.toString())}>
                  <Typography
                    variant="h2"
                    color={currentTab === OTHER.toString() ? "text.primary" : "text.secondary"}>Other</Typography>
                </Box>
              </Stack>
            </Stack>
            {
              walletEvents.length > 1 ? (
                <Grid container>
                  {walletEvents.map((event) => {
                    return (
                      <Grid item width="100%">
                        <EventItem event={event} />
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
