import React from 'react';
import { BoxProps, Grid, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tabLabels } from '~/pages/market/pods/activity';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const ActivityTableHeader: FC<BoxProps & { tab: number; handleChangeTab: any }> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Grid container direction="row" p={1} borderBottom={1} borderColor="divider">
      <Grid item xs={5} md={4}>
        {isMobile ? (
          <Row alignItems="center" height="100%">
            <Typography color="text.tertiary">All</Typography>
          </Row>
        ) : (
          <Tabs value={props.tab} onChange={props.handleChangeTab}>
            {/* All */}
            <Tab label={tabLabels[0]} />
            {/* Create */}
            <Tab label={tabLabels[1]} />
            {/* Fill */}
            <Tab label={tabLabels[2]} />
            {/* Cancel */}
            <Tab label={tabLabels[3]} />
          </Tabs>
        )}
      </Grid>
      <Grid item xs={3} md={1.63}>
        <Row alignItems="center" height="100%">
          <Typography color="text.tertiary">Pods</Typography>
        </Row>
      </Grid>
      <Grid item xs={0} md={1.6}>
        <Row alignItems="center" height="100%" display={{ xs: 'none', md: 'block' }}>
          <Typography color="text.tertiary">Podline</Typography>
        </Row>
      </Grid>
      <Grid item xs={0} md={1.59}>
        <Row alignItems="center" height="100%" display={{ xs: 'none', md: 'block' }}>
          <Typography textAlign="right" color="text.tertiary">Price</Typography>
        </Row>
      </Grid>
      <Grid item xs={4} md={1.59}>
        <Row alignItems="center" height="100%" justifyContent="end">
          <Typography textAlign="right" color="text.tertiary">Total Value</Typography>
        </Row>
      </Grid>
      <Grid item xs={0} md={1.59}>
        <Row alignItems="center" height="100%" display={{ xs: 'none', md: 'block' }}>
          <Typography textAlign="right" color="text.tertiary">Time</Typography>
        </Row>
      </Grid>
    </Grid>
  );
};

export default ActivityTableHeader;
