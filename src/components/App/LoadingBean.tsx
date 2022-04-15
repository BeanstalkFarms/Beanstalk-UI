/* eslint-disable */
import React from 'react';
import { Box } from '@mui/material';
import BeanLogo from 'img/bean-logo.svg';
import { theme } from 'constants/index';
import './index.tsx';
import {makeStyles} from "@mui/styles";

const useStyles = makeStyles({
  root: {
    height: 'calc(100vh - 100px)',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default function LoadingBean() {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className="Loading-logo">
        <img
          className="svg"
          // @ts-ignore
          name={theme.name}
          height="250px"
          src={BeanLogo}
          alt=""
        />
      </Box>
    </Box>
  );
}
