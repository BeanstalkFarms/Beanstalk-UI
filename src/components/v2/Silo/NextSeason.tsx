import React from 'react';
import { Accordion, AccordionDetails, Box, Divider, Grid, Stack, Typography } from '@mui/material';
import AccordionWrapper from '../Common/Accordion/AccordionWrapper';
import StyledAccordionSummary from '../Common/Accordion/AccordionSummary';

// const 

const NextSeason : React.FC<{ title: string | JSX.Element }> = ({ title }) => (
  <AccordionWrapper>
    <Accordion>
      <StyledAccordionSummary
        title={title}
        icon={<Typography>⏱</Typography>}
      />
      <AccordionDetails sx={{ p: 0, pb: 2 }}>
        <Box sx={{ px: 2 }}>
          <Grid container columnSpacing={4}>
            <Grid item xs={6}>
              <Typography variant="h4">Bean Rewards</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4">Stalk Rewards</Typography>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ borderColor: 'secondary', my: 2 }} />
        <Box sx={{ px: 2 }}>
          <Grid container columnSpacing={4}>
            <Grid item xs={6}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h4">My Earned Beans</Typography>
                <Typography variant="h4">My Earned Beans</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h4">My Earned Beans</Typography>
                <Typography variant="h4">My Earned Beans</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  </AccordionWrapper>
);

export default NextSeason;
