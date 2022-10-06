import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container, Link,
  Stack, Typography,
} from '@mui/material';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import useTabs from '~/hooks/display/useTabs';
import useMarketplaceEventData, { QUERY_AMOUNT } from '~/hooks/beanstalk/useMarketplaceEventData';
import { Module, ModuleContent } from '~/components/Common/Module';
import Row from '~/components/Common/Row';
import ActivityTableHeader from '~/components/Market/Pods/Tables/ActivityTableHeader';
import ActivityTableRow from '~/components/Market/Pods/Tables/ActivityTableRow';

import { FC } from '~/types';

export const tabLabels = ['All', 'Create', 'Fill', 'Cancel'];

const MarketActivityPage: FC = () => {
  // Local State
  const [tab, handleChangeTab] = useTabs();
  const [scrollPosition, setScrollPosition] = useState<number | undefined>();

  const { data, harvestableIndex, loading, fetchMoreData } = useMarketplaceEventData();

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
  
  const filteredData = useMemo(() => {
    if (tab === 0) return data;
    const label = tabLabels[tab].toLowerCase();
    return data.filter((event) => event.action === label);
  }, [data, tab]);

  const initializing = (
    data.length === 0
    || harvestableIndex.lte(0)
  );

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title="Marketplace Activity"
          returnPath="/market"
        />
        <Module sx={{ pt: 2, px: 1 }}>
          <ModuleContent>
            {initializing
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
                  {filteredData.map((e) => (
                    <ActivityTableRow key={e.id} event={e} />
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
