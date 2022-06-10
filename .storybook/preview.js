import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { HashRouter } from 'react-router-dom';
import theme from 'components/App/muiTheme';

import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
    <HashRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      </StyledEngineProvider>
    </HashRouter>
  )
]