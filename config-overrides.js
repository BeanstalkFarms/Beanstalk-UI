/* config-overrides.js */
/* eslint-disable react-hooks/rules-of-hooks */
// https://mui.com/material-ui/guides/minimizing-bundle-size/#option-2
const { useBabelRc, override } = require('customize-cra');

module.exports = override(useBabelRc());