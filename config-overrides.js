/* config-overrides.js */
/* eslint-disable react-hooks/rules-of-hooks */
// https://mui.com/material-ui/guides/minimizing-bundle-size/#option-2
const { useBabelRc, override } = require('customize-cra');

module.exports = override(
  useBabelRc(),
  // Solved an issue with .mjs files from `react-query` (a
  // dependency of wagmi) not being packaged properly.
  // 05/20/2022
  (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });
    return config;
  }
);
