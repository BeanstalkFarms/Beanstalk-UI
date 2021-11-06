/* eslint-disable */
import React from 'react';
import { Box } from '@material-ui/core';
import BeanLogo from '../../img/bean-logo.svg';
import './index.tsx';
import { theme } from '../../constants';

export default function LoadingBean() {
  const { innerHeight: height } = window;

  return (
    <Box style={{ height: height - 60, overflow: 'hidden' }}>
      <Box style={{ marginTop: height / 2 - 125 }}>
        <Box className="Loading-logo">
          <img
            className="svg"
            name={theme.name}
            style={{ verticalAlign: 'middle' }}
            height="250px"
            src={BeanLogo}
            alt="bean.money"
          />
        </Box>
      </Box>
    </Box>
  );
}
