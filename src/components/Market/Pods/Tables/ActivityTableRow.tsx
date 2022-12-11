import React from 'react';
import { BoxProps, Grid, Link, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import Row from '~/components/Common/Row';
import { displayBN } from '~/util';
import { ZERO_BN } from '~/constants';
import podIcon from '~/img/beanstalk/pod-icon.svg';
import beanIcon from '~/img/tokens/bean-logo-circled.svg';
import { MarketEvent } from '~/hooks/beanstalk/useMarketplaceEventData';
import EntityIcon from '~/components/Market/Pods/EntityIcon';

import { FC } from '~/types';

// get current user's timezone
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZoneName;

const actionToModifier = {
  buy: '💰',
  sell: '💰',
  create: '✏️',
  cancel: '❌',
  unknown: undefined,
  listing: '💰',
  order: '✏️'
};

const ActivityTableRow: FC<BoxProps & { event: MarketEvent }> = (props) => {
  // setup
  const e = props.event;
  const date = DateTime.fromMillis(Number(e.time) * 1000 as number);

  // build date strings
  const topDate = date.toLocaleString({
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: userTimezone
  });

  const bottomDate = date.toLocaleString({
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    timeZoneName: 'short',
    timeZone: userTimezone
  });

  return (
    <Grid container direction="row" px={1} py={0.75} borderBottom={1} borderColor="divider">
      <Grid item xs={5} md={4}>
        <Row alignItems="center" height="100%" gap={1}>
          <Typography fontSize={14}>
            {actionToModifier[e.action]}
          </Typography>
          {e.entity !== 'unknown' ? (
            <EntityIcon type={e.entity as any} />
          ) : null}
          <Link
            href={`https://etherscan.io/tx/${e.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.primary"
          >
            <Typography>
              {e.label}
            </Typography>
          </Link>
        </Row>
      </Grid>
      <Grid item xs={3} md={1.63}>
        <Row gap={0.3} alignItems="center" height="100%">
          <Typography>{displayBN(e.numPods || ZERO_BN)}</Typography>
          <img src={podIcon} alt="Pod Icon" height="18px" />
        </Row>
      </Grid>
      <Grid item xs={0} md={1.6} display={{ xs: 'none', md: 'block' }}>
        <Row alignItems="center" height="100%">
          <Typography>{e.placeInPodline}</Typography>
        </Row>
      </Grid>
      <Grid item xs={0} md={1.59} display={{ xs: 'none', md: 'block' }}>
        <Row gap={0.3} justifyContent="end" alignItems="center" height="100%">
          <img src={beanIcon} alt="Bean Icon" height="18px" />
          <Typography>{displayBN(e.pricePerPod || ZERO_BN)}</Typography>
        </Row>
      </Grid>
      <Grid item xs={4} md={1.59}>
        <Row justifyContent="end" alignItems="center" height="100%">
          <Typography>${displayBN(e.totalValue || ZERO_BN)}</Typography>
        </Row>
      </Grid>
      <Grid item xs={0} md={1.59} display={{ xs: 'none', md: 'block' }}>
        <Stack justifyContent="end">
          <Typography textAlign="right">{topDate}</Typography>
          <Typography textAlign="right">{bottomDate}</Typography>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ActivityTableRow;
