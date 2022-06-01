/* eslint-disable */
import {Container} from '@mui/system';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppState} from 'state';
import PageHeader from "../components/v2/Common/PageHeader";
import {Box, Button, Card, Divider, Grid, Stack, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";
import ButtonFilters from "../components/v2/History/ButtonFilters";
import BigNumber from "bignumber.js";
import {displayBN} from "../util";
import {FIELD, OTHER, SILO} from "../util/GetEventFacet";
import {ParsedEvent} from "../state/v2/farmer/events/updater";

const buttonStyle = {
  cursor: "pointer",
  // border: 1,
  // pl: 1,
  // pr: 1,
  // pt: 0.5,
  // pb: 0.5,
  // borderRadius: "25px"
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
                        <Stack gap={0.2} pt={1} pb={1}>
                          {
                            event?.returnValues?.season && (
                              <Typography>Season {displayBN(event.returnValues.season)}</Typography>
                            )
                          }
                          <Stack direction="row" justifyContent="space-between">
                            <Typography>{event.event}</Typography>
                            <Typography>10</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{opacity: 0.7}}>03/24/2022 13:24:24 PM</Typography>
                            <Typography>20</Typography>
                          </Stack>
                        </Stack>
                        <Divider/>
                      </Grid>
                    )
                  })}
                </Grid>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="250px">
                  <Typography variant="h3">No events of this type!</Typography>
                </Box>
              )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default TransactionHistoryPage;
