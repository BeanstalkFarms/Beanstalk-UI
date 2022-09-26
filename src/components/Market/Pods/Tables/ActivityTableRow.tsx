import React from 'react';
import { BoxProps, Grid, Link, Typography } from '@mui/material';
import moment from 'moment';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import { displayBN } from '~/util';
import { ZERO_BN } from '~/constants';
import podIcon from '~/img/beanstalk/pod-icon.svg';
import beanIcon from '~/img/tokens/bean-logo-circled.svg';
import { MarketEvent } from '~/hooks/beanstalk/useMarketplaceEventData';

const ActivityTableRow: React.FC<BoxProps & { event: MarketEvent }> = (props) => {
  const e = props.event;
  return (
    <Grid container direction="row" px={1} py={1.5} borderBottom={1} borderColor={BeanstalkPalette.blue}>
      <Grid item xs={5} md={4}>
        <Link
          href={`https://etherscan.io/tx/${e.hash}`}
          target="_blank"
          rel="noopener noreferrer">
          <Typography>
            {e.label}
          </Typography>
        </Link>
      </Grid>
      <Grid item xs={3} md={1.63}>
        <Row gap={0.3} alignItems="center" height="100%">
          <Typography>{displayBN(e.numPods || ZERO_BN)}</Typography>
          <img src={podIcon} alt="Pod Icon" height="18px" />
        </Row>
      </Grid>
      <Grid item xs={0} md={1.6} display={{ xs: 'none', md: 'block' }}>
        <Row>
          <Typography>{e.placeInPodline}</Typography>
        </Row>
      </Grid>
      <Grid item xs={0} md={1.59} display={{ xs: 'none', md: 'block' }}>
        <Row gap={0.3} justifyContent="end">
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
        <Row justifyContent="end">
          <Typography>{moment(new Date((e.time as number) * 1000)).fromNow()}</Typography>
        </Row>
      </Grid>
    </Grid>
  );
};

export default ActivityTableRow;
