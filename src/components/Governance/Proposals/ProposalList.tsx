import React from 'react';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import EmptyState from '~/components/Common/ZeroState/EmptyState';
import { displayBN, trimAddress } from '~/util';
import blueCircle from '~/img/interface/blue-circle.svg';
import { BeanstalkPalette, IconSize } from '~/components/App/muiTheme';
import { AppState } from '~/state';

const ProposalList: React.FC<{ title: string; proposals: any; }> = (props) => {
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const totalStalk = beanstalkSilo.stalk.total;
  
  if (props.proposals === undefined) {
    return null;
  }
  
  return (
    <Stack px={2} pb={2} gap={2}>
      <Typography>{props.title}</Typography>
      <Stack gap={2}>
        {props.proposals.length === 0 ? (
          <EmptyState message="No proposals of this type." />
        ) : (
          <>
            {props.proposals.map((p: any) => (
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  p: 2,
                  height: 'auto', // FIXME
                  // display: 'block',
                  color: '#000000',
                  borderColor: '#c7ddf0',
                }}
              >
                <Stack gap={1} width="100%">
                  {/* top row */}
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <img src={blueCircle} alt="" width={IconSize.small} />
                      <Link href={p.link} underline="hover" color="text.primary" target="_blank">
                        <Typography variant="body1">{trimAddress(p.id)}</Typography>
                      </Link>
                    </Stack>
                    {/* show if user has voted */}
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <CheckIcon sx={{ color: BeanstalkPalette.logoGreen, width: IconSize.small }}  />
                      <Typography variant="body1">Voted</Typography>
                    </Stack>
                  </Stack>
                  {/* middle row */}
                  <Stack gap={1}>
                    <Typography textAlign="left" variant="bodyLarge">{p.title}</Typography>
                    <Typography textAlign="left" color="gray" variant="body1">{p.title}</Typography>
                  </Stack>
                  {/* bottom row */}
                  <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between">
                    <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ xs: 'start', lg: 'center' }} gap={{ xs: 0, lg: 2 }}>
                      <Stack direction="row" display="inline-flex" alignItems="center" gap={0.5}>
                        <Box
                          className="B-badge"
                          sx={{
                            opacity: 0.7,
                            width: 8,
                            height: 8,
                            backgroundColor: p.state === 'active' ? 'primary.main' : 'gray',
                            borderRadius: 4
                          }}
                        />
                        <Typography variant="body1">{p.state.charAt(0).toUpperCase() + p.state.slice(1)}</Typography>
                      </Stack>
                      <Typography variant="body1">Vote ends in 6 days</Typography>
                      <Stack direction="row" gap={0.5}>
                        <Typography variant="body1">Quorum</Typography>
                      </Stack>
                    </Stack>
                    {/* show if user has voted */}
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Typography variant="body1">{displayBN(new BigNumber(p.scores[0]).div(totalStalk).multipliedBy(100))}% of Stalk voted For</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Button>
            ))}
          </>
        )}

      </Stack>
    </Stack>
  );
};

export default ProposalList;
