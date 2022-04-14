/* eslint-disable */
import React from 'react';
import { Box } from '@material-ui/core';
import BeanLogo from 'img/bean-logo.svg';
import { theme } from 'constants/index';
import './index.tsx';

export default function LoadingBean() {
  const { innerHeight: height } = window;

  return (
    <Box style={{ height: height - 100, overflow: 'hidden', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box className="Loading-logo">
        <img
          className="svg"
          name={theme.name}
          style={{ verticalAlign: 'middle' }}
          height="250px"
          src={BeanLogo}
          alt=""
        />
      </Box>
    </Box>
  );
}
