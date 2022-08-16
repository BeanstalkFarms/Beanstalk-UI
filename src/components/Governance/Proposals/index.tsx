import React, { useMemo } from 'react';
import { Box, Card, Stack, Tabs } from '@mui/material';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from '~/components/Common/BadgeTab';
import ProposalList from '~/components/Governance/Proposals/ProposalList';
import { ProposalsDocument } from '~/generated/graphql';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';

/// Variables
const snapshotSpaces = ['beanstalkdao.eth', 'beanstalkfarms.eth', 'wearebeansprout.eth'];
const SLUGS = ['dao', 'beanstalk-farms', 'bean-sprout'];
const queryConfig = {
  variables: { space_in: snapshotSpaces },
};

const Proposals: React.FC = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'type');

  /// Query Proposals
  const { loading, error, data } = useGovernanceQuery(ProposalsDocument, queryConfig);

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
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 &&
            <ProposalList
              title="A BIP is a Beanstalk Improvement Proposal. A BIP requires 50% of all STALK in order to be committed."
              proposals={filteredProposals}
            />
          }
          {tab === 1 &&
            <ProposalList
              title="A BOP is a..."
              proposals={filteredProposals}
            />
          }
          {tab === 2 &&
            <ProposalList
              title="A BFCP is a..."
              proposals={filteredProposals}
            />
          }
        </Box>
      </Stack>
    </Card>
  );
};

export default Proposals;
