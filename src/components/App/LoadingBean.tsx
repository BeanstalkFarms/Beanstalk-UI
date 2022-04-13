/* eslint-disable */
import React from 'react';
import { Box } from '@mui/material';
import BeanLogo from 'img/bean-logo.svg';
import { theme } from 'constants/index';
import './index.tsx';
import {makeStyles} from "@mui/styles";

const useStyles = makeStyles({
    root: {
        height: (props: any) => props.height - 100,
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default function LoadingBean() {
  const { innerHeight: height } = window;
  const props = {
      height: height
  }
  const classes = useStyles(props)

  return (
    <Box className={classes.root}>
      <Box className="Loading-logo">
        <img
          className="svg"
          name={theme.name}
          style={{ verticalAlign: 'middle' }}
          height="250px"
          src={BeanLogo}
          alt="app.bean.money"
        />
      </Box>
    </Box>
  );
}
