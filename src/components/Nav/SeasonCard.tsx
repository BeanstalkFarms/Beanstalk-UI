import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
/**
 * Displays data about a Pool containing Beans and other assets.
 */
const SeasonCard: React.FC = () => (
  <Box sx={{ border: 1, borderColor: '#C7DDF0', p: 1, borderRadius: '8px' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        color="text.primary"
        sx={{ fontSize: '14px', fontWeight: 500 }}
      >
        6075
      </Typography>

      <Box>
        <Stack direction="row" alignItems="center" spacing="2px">
          <img
            src={rainySeasonIcon}
            style={{ width: 16, height: 16 }}
            alt="dry/rainy season"
          />
          <Typography
            color="text.primary"
            sx={{ fontSize: '14px', fontWeight: 500 }}
          >
            Rainy Season
          </Typography>
        </Stack>
      </Box>

      <Typography
        color="text.primary"
        sx={{ fontSize: '14px', fontWeight: 500 }}
      >
        0
      </Typography>

      <Typography
        color="text.primary"
        sx={{ fontSize: '14px', fontWeight: 500 }}
      >
        193,100
      </Typography>

      <Typography
        color="text.primary"
        sx={{ fontSize: '14px', fontWeight: 500 }}
      >
        5099
      </Typography>
    </Stack>
  </Box>
);

export default SeasonCard;
