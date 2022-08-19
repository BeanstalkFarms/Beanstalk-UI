import React, { useCallback } from 'react';
import { Box, Card, Stack, Tabs } from '@mui/material';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from '~/components/Common/BadgeTab';
import ProposalList from '~/components/Governance/Proposals/ProposalList';
import { useProposalsQuery } from '~/generated/graphql';
import { Proposal } from '~/util/Governance';

/// Variables
const SNAPSHOT_SPACES = ['beanstalkdao.eth', 'beanstalkfarms.eth', 'wearebeansprout.eth'];
const SLUGS = ['dao', 'beanstalk-farms', 'bean-sprout'];
const queryConfig = {
  variables: { space_in: SNAPSHOT_SPACES },
  context: { subgraph: 'snapshot' }
};

const Proposals: React.FC = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'type');

  /// Query Proposals
  const { loading, data } = useProposalsQuery(queryConfig);

  const filterBySpace = useCallback((t: number) => {
    if (!loading && data?.proposals) {
      return data.proposals.filter(
        (p) => p !== null && p?.space?.id === SNAPSHOT_SPACES[t]
      ) as Proposal[];
    }
    return [];
  }, [data, loading]);

  /// true if any proposals are active
  const hasActive = (proposals: Proposal[]) => {
    if (proposals) {
      return proposals.filter(
        (p) => p?.state === 'active'
      ).length > 0;
    }
    return false;
  };

  /// Filter proposals & check if there are any active ones
  const filterProposals = useCallback((t: number) => {
    const filtered = filterBySpace(t);
    const hasActiveProposals = hasActive(filtered);
    return [filtered, hasActiveProposals] as const;
  }, [filterBySpace]);

  const [daoProposals, hasActiveDao] = filterProposals(0);
  const [beanstalkFarmsProposals, hasActiveBF] = filterProposals(1);
  const [beanSproutProposals, hasActiveBS] = filterProposals(2);

  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
            variant="scrollable">
            <BadgeTab label="DAO" showBadge={hasActiveDao as boolean} />
            <BadgeTab label="Beanstalk Farms" showBadge={hasActiveBF as boolean} />
            <BadgeTab label="Bean Sprout" showBadge={hasActiveBS as boolean} />
          </Tabs>
        </Stack>
        <Box>
          {tab === 0 && <ProposalList proposals={daoProposals} />}
          {tab === 1 && <ProposalList proposals={beanstalkFarmsProposals} />}
          {tab === 2 && <ProposalList proposals={beanSproutProposals} />}
        </Box>
      </Stack>
    </Card>
  );
};

export default Proposals;
