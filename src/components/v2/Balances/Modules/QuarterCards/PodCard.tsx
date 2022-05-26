/* eslint-disable */
import React from 'react';
import {Box, Card, Grid, Link, Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import podIcon from "../../../../../img/pod-logo.svg";
import seedIcon from "../../../../../img/seed-logo.svg";

const useStyles = makeStyles(() => ({}))

export interface PodCardProps {
  title: string;
  hideButton?: boolean;
}

const PodCard: React.FC<PodCardProps> =
  ({
     title,
     hideButton = false
   }) => {
    const classes = useStyles();

    return (
      <Card sx={{p: 2, height: "100%"}}>
        <Stack gap={2} justifyContent="space-between" height="100%">
          <Stack>
            <Typography>{title}</Typography>
            <Stack direction="row" alignItems="center">
              <img alt="" src={podIcon} height="25px"/>
              <Typography variant="h2">109,364</Typography>
            </Stack>
          </Stack>
          <Box display="flex" justifyContent="center">
            <Typography>GRAPH</Typography>
          </Box>
          <Stack gap={0.7}>
            {
              (!hideButton) && (
                <Link
                  underline="none"
                  rel="noreferrer"
                  sx={{cursor: "pointer"}}
                >
                  <Typography variant="body1" sx={{textAlign: 'center'}}>
                    View All Plots
                  </Typography>
                </Link>
              )
            }
          </Stack>
        </Stack>
      </Card>
    );
  };

export default PodCard;
