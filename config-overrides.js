/* config-overrides.js */
/* eslint-disable react-hooks/rules-of-hooks */
// https://mui.com/material-ui/guides/minimizing-bundle-size/#option-2
const { useBabelRc, override } = require('customize-cra');
const CircularDependencyPlugin = require('circular-dependency-plugin');

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
    config.plugins.push(
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /a\.js|node_modules/,
        // include specific files based on a RegExp
        // include: /dir/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      })
    )
    return config;
  },
);
