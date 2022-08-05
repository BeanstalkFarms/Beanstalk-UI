import React from 'react';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import { displayBN } from '../../util';
import SimplePodLineChart from './PodLineChart';
import { PlotMap } from '../../state/farmer/field';

export interface PodLineSectionProps {
  numPodsTitle: string;
  numPodsDisplay: BigNumber;
  podLine: BigNumber;
  harvestableIndex: BigNumber;
  plots: PlotMap<BigNumber>;
}

const PodLineSection: React.FC<PodLineSectionProps> = ({
  numPodsDisplay,
  numPodsTitle,
  podLine,
  harvestableIndex,
  plots
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Box
      sx={{
        backgroundColor: '#F6FAFE',
        px: 2,
        py: 1.5,
        borderRadius: 1.5,
      }}
    >
      <Stack direction={isMobile ? 'column' : 'row'} gap={2} alignItems={isMobile ? 'left' : 'center'}>
        <Stack width={isMobile ? '100%' : '20%'} gap={0.5}>
          <Typography variant="h4">{numPodsTitle}</Typography>
          <Typography variant="h1">{displayBN(numPodsDisplay)}</Typography>
        </Stack>
        <Stack width={isMobile ? '100%' : '80%'}>
          <SimplePodLineChart
            harvestableIndex={harvestableIndex}
            farmerPlots={plots}
            podLineSize={podLine}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default PodLineSection;
