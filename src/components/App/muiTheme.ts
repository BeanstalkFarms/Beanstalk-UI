import { createTheme } from '@mui/material/styles';
import { theme } from 'constants/index';

// FIXME: changes to createTheme don't hot reload.
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#3B3B3B',
    },
    secondary: {
      main: '#DCBA6A',
    },
    background: {
      main: '#EFF7FF',
    },
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          color: theme.accentText,
          backgroundColor: theme.secondary,
          // FIXME: :first-of-type overrides the
          // root border radius for some reason here.
          // We should probably use MUI's core border radius
          // setting for this component instead of this override.
          borderRadius: '15px',
          '&:first-of-type': {
            borderRadius: '15px',
          },
        }
      }
    }
  }
});

export default muiTheme;
