import React, { useMemo } from 'react';
import { Box, Card, Stack, Tabs } from '@mui/material';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from '~/components/Common/BadgeTab';
import ProposalList from '~/components/Governance/Proposals/ProposalList';
import { ProposalsDocument } from '~/generated/graphql';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';

export type Proposal = {
  /** Proposal ID on Snapshot. */
  id: string;
  /** */
  title: string;
  /** Number of Stalk voted for each choice */
  scores: number[];
  /** Status of proposal: active, closed, etc. */
  state: string;
  /** Date & time the proposal closes */
  end: number;
}

/// Variables
const snapshotSpaces = ['beanstalkdao.eth', 'beanstalkfarms.eth', 'wearebeansprout.eth'];
const SLUGS = ['dao', 'beanstalk-farms', 'bean-sprout'];
const queryConfig = {
  variables: { space_in: snapshotSpaces },
};

const Proposals: React.FC = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'type');

  /// Query Proposals
  const { loading, data } = useGovernanceQuery(ProposalsDocument, queryConfig);

  // filter proposals by type (eg: BIP, BOP, ...)
  const filteredProposals = useMemo(() => {
    if (!loading && data !== undefined) {
      return data.proposals.filter((p: any) => p.space.id === snapshotSpaces[tab]);
    }
  }, [data, loading, tab]);

  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
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
            <BadgeTab label="DAO" showBadge />
            <BadgeTab label="Beanstalk Farms" showBadge={false} />
            <BadgeTab label="Bean Sprout" showBadge={false} />
          </Tabs>
        </Stack>
        <Box>
          <ProposalList proposals={filteredProposals} />
        </Box>
      </Stack>
    </Card>
  );
};

export default Proposals;
