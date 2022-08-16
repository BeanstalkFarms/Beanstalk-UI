import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Container,
  Stack, Typography
} from '@mui/material';
import { useParams } from 'react-router-dom';
import PageHeader from '~/components/Common/PageHeader';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import { ProposalDocument } from '~/generated/graphql';
import { trimAddress } from '~/util';
import blueCircle from '~/img/interface/blue-circle.svg';
import { IconSize } from '~/components/App/muiTheme';
import MarkdownWrapper from '~/components/Common/MarkdownWrapper';

const ProposalPage: React.FC = () => {
  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query proposal data
  const queryConfig = useMemo(() => ({
    variables: { proposal_id: id }
  }), [id]);
  const { loading, error, data } = useGovernanceQuery(ProposalDocument, queryConfig);

  if (loading || data === undefined) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          // title={`${data?.proposal?.title}`}
          returnPath="/governance"
        />
        <Card sx={{ p: 2 }}>
          <Stack gap={2}>
            {/* title & stats */}
            <Stack gap={1}>
              <Typography variant="bodyLarge">{data?.proposal?.title}</Typography>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                alignItems={{ xs: 'start', lg: 'center' }}
                gap={{ xs: 0, lg: 2 }}>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <img src={blueCircle} alt="" width={IconSize.small} />
                  <Typography variant="body1">{trimAddress(data?.proposal?.id)}</Typography>
                </Stack>
                <Stack direction="row" display="inline-flex" alignItems="center" gap={0.5}>
                  <Box
                    className="B-badge"
                    sx={{
                      opacity: 0.7,
                      width: 8,
                      height: 8,
                      backgroundColor: data?.proposal?.state === 'active' ? 'primary.main' : 'gray',
                      borderRadius: 4
                    }}
                  />
                  <Typography
                    variant="body1">{data?.proposal?.state.charAt(0).toUpperCase() + data?.proposal?.state.slice(1)}
                  </Typography>
                </Stack>
                <Typography variant="body1">Vote ends in 6 days</Typography>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="body1">Quorum</Typography>
                </Stack>
              </Stack>
            </Stack>
            {/* markdown */}
            <Box>
              <MarkdownWrapper>{data?.proposal?.body}</MarkdownWrapper>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default ProposalPage;
