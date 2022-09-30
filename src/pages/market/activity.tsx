import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container, Link,
  Stack, Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import useTabs from '~/hooks/display/useTabs';
import useMarketplaceEventData, { QUERY_AMOUNT } from '~/hooks/beanstalk/useMarketplaceEventData';
import { Module, ModuleContent } from '~/components/Common/Module';
import Row from '~/components/Common/Row';
import ActivityTableHeader from '~/components/Market/Pods/Tables/ActivityTableHeader';
import ActivityTableRow from '~/components/Market/Pods/Tables/ActivityTableRow';

export const tabLabels = ['All', 'Create', 'Fill', 'Cancel'];

const MarketActivityPage: React.FC = () => {
  // Local State
  const [tab, handleChangeTab] = useTabs();
  const [scrollPosition, setScrollPosition] = useState<number | undefined>();

  const { data, loading, fetchMoreData } = useMarketplaceEventData();

  const handleFetchMore = () => {
    fetchMoreData();
    setScrollPosition(window.scrollY);
  };

  useEffect(() => {
    if (scrollPosition) {
      window.scrollTo(0, scrollPosition || 0);
      setScrollPosition(undefined);
    }
  }, [data, scrollPosition]);

  console.log('MARKET EVENT   ', DateTime.fromMillis(1664388071 * 1000 as number).toLocaleString({
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'PST'
  }));

  console.log('LISTING CANCEL', DateTime.fromMillis(1662226017 * 1000 as number).toLocaleString({
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'PST'
  }));

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title="Marketplace Activity"
          returnPath="/market"
        />
        <Module sx={{ pt: 2, px: 1 }}>
          <ModuleContent>
            {data === undefined
              ? (
                <Stack height={300} alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Stack>
              )
              : (
                <>
                  {/* Table header */}
                  <ActivityTableHeader tab={tab} handleChangeTab={handleChangeTab} />
                  {/* Table body */}
                  {data.filter((e) => (
                    tab === 0
                      ? e.action !== 'default'
                      : e.action === tabLabels[tab].toLowerCase()
                  )).map((e) => (
                    <ActivityTableRow event={e} />
                  ))}
                  <Box p={1}>
                    {loading ? (
                      <Row justifyContent="center">
                        <CircularProgress size={25} />
                      </Row>
                    ) : (
                      <Link onClick={handleFetchMore}>
                        <Typography textAlign="center" sx={{ cursor: 'pointer' }}>Load {QUERY_AMOUNT} more</Typography>
                      </Link>
                    )}
                  </Box>
                </>
              )}
          </ModuleContent>
        </Module>
      </Stack>
    </Container>
  );
};

export default MarketActivityPage;
