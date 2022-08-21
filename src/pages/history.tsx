import { Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Grid, Stack, Tab, Tabs } from '@mui/material';
import EventItem from '~/components/History/EventItem';
import WalletButton from '~/components/Common/Connection/WalletButton';
import { Event } from '~/lib/Beanstalk/EventProcessor';
import { AppState } from '~/state';
import useAccount from '../hooks/ledger/useAccount';
import useChainId from '../hooks/useChain';
import { getEventCacheId } from '../util/State';
import { EventCacheName } from '../state/farmer/events2';
import EmptyState from '../components/Common/ZeroState/EmptyState';

const facetByTab = {
  0: undefined,
  1: EventCacheName.SILO,
  2: EventCacheName.FIELD,
};

const TransactionHistoryPage: React.FC = () => {
  const account = useAccount();
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const events = useSelector<AppState, AppState['_farmer']['events2']>((state) => state._farmer.events2);
  const [walletEvents, setWalletEvents] = useState<Event[]>();
  const chainId = useChainId();

  const handleSetTab = (event: React.SyntheticEvent, newValue: 0 | 1 | 2) => setTab(newValue);

  useEffect(() => {
    function filterEventsByFacet() {
      if (account) {
        if (tab === 0) {
          // ALL EVENTS
          const allEvents = Object.keys(events).reduce<Event[]>((prev, curr) => {
            const eventsByCacheId = events[curr].events;
            return prev.concat(eventsByCacheId);
          }, []);
          allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
          setWalletEvents(allEvents);
        } else if (facetByTab[tab]) {
          // SILO, FIELD, etc
          const cacheId = getEventCacheId(chainId, account, facetByTab[tab]);
          const facetEvents = [...events[cacheId].events];
          facetEvents.sort((a, b) => b.blockNumber - a.blockNumber);
          setWalletEvents(facetEvents);
        } else {
          setWalletEvents([]);
        }
      }
    }
    filterEventsByFacet();
  }, [account, chainId, events, tab]);

  if (!account) {
    return (
      <Card component={Stack} direction="row" alignItems="center" justifyContent="center" sx={{ p: 4 }}>
        <WalletButton variant="outlined" color="primary" />
      </Card>
    );
  }

  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <Card sx={{ border: 'none', p: 2 }}>
          <Stack gap={0.5}>
            <Tabs value={tab} onChange={handleSetTab} sx={{ minHeight: 0 }}>
              <Tab label="All" />
              <Tab label="Silo" />
              <Tab label="Field" />
              {/* <Tab label="Other" /> */}
            </Tabs>
            {walletEvents !== undefined && walletEvents.length > 0 ? (
              <Grid container>
                {walletEvents.map((event) => (
                  <Grid key={`${event.transactionHash}-${event.logIndex}`} item width="100%">
                    <EventItem
                      event={event}
                      account={account ? account.toString().toLowerCase() : ''}
                      />
                  </Grid>
                  ))}
              </Grid>
            ) : (
              <EmptyState message="No transactions of this type." />
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default TransactionHistoryPage;
