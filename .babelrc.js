// https://mui.com/material-ui/guides/minimizing-bundle-size/#option-2
const plugins = [
  [
    'babel-plugin-import',
    {
      libraryName: '@mui/material',
      libraryDirectory: '',
      camel2DashComponentName: false,
    },
    'core',
  ],
  [
    'babel-plugin-import',
    {
      libraryName: '@mui/icons-material',
      libraryDirectory: '',
      camel2DashComponentName: false,
    },
    'icons',
  ],
  [
    'babel-plugin-transform-remove-console',
    {
      // During production build, hide `console.debug` calls.
      "exclude": ["error", "warn", "log"]
    }
  ]
];

module.exports = { plugins };