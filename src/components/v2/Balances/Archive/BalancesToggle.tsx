/* eslint-disable */
import React from 'react';
import {Stack, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles(() => ({
  sectionToggle: {
    fontSize: "20px",
    fontWeight: 600,
    cursor: "pointer"
  }
}))

export interface HorizontalScrollProps {
  balancesTab: string;
  handleSetTab: (val?: any) => void;
}

const BalancesToggle: React.FC<HorizontalScrollProps> = ({balancesTab, handleSetTab}) => {
  const classes = useStyles();

  return (
    <Stack direction="row" gap={2} sx={{pb: 1.5}}>
      <Typography
        onClick={() => handleSetTab("user-balance")}
        className={classes.sectionToggle}
        sx={{
          color: (balancesTab === "user-balance" ? "#000000" : "#9e9e9e"),
        }}
      >
        My Balances
      </Typography>
      <Typography
        onClick={() => handleSetTab("beanstalk-balance")}
        className={classes.sectionToggle}
        sx={{
          color: (balancesTab === "beanstalk-balance" ? "#000000" : "#9e9e9e"),
        }}
      >
        Beanstalk Balances
      </Typography>
    </Stack>
  );
};

export default BalancesToggle;
