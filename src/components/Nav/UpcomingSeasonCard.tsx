import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

/**
 * Displays data about a Pool containing Beans and other assets.
 */
const UpcomingSeasonCard: React.FC = () => (
  <Box
    sx={{
      border: 1,
      borderColor: '#DDDDDD',
      p: 0.75,
      borderRadius: '8px',
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        color="text.primary"
        sx={{
          fontSize: '14px',
          fontWeight: 500,
          width: '15%',
          textAlign: 'left',
        }}
      >
        6075
      </Typography>

      <Box sx={{ width: '20%', alignSelf: 'flex-start' }}>
        <Stack direction="row" alignItems="center" spacing="2px">
          <img
            src={drySeasonIcon}
            style={{ width: 16, height: 16 }}
            alt="dry/rainy season"
          />
          <Typography
            color="text.primary"
            sx={{ fontSize: '14px', fontWeight: 500 }}
          >
            Dry
          </Typography>
        </Stack>
      </Box>

      <Typography
        color="text.primary"
        sx={{
          fontSize: '14px',
          fontWeight: 500,
          width: '20%',
          textAlign: 'left',
        }}
      >
        0
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        sx={{ width: '20%', alignSelf: 'flex-start' }}
      >
        <ArrowUpwardIcon sx={{ width: '14px', height: '14px' }} />

        <Typography
          color="text.primary"
          sx={{
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          193,100
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing="6px"
        sx={{ width: '20%', alignSelf: 'flex-end' }}
      >
        <Typography
          color="text.primary"
          sx={{
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          5099
        </Typography>

        <Stack direction="row" alignItems="center">
          <Typography
            color="text.primary"
            sx={{
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            (
          </Typography>

          <ArrowUpwardIcon sx={{ width: '14px', height: '14px' }} />

          <Typography
            color="text.primary"
            sx={{
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            3%)
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </Box>
);

export default UpcomingSeasonCard;
