import { createTheme, experimental_sx as sx, responsiveFontSizes } from '@mui/material/styles';

// --------------------------------------------------

declare module '@mui/material/styles' {
  interface Palette {
    light: Palette['primary'];
    dark: Palette['primary'];
  }
  interface PaletteOptions {
    light: PaletteOptions['primary'];
    dark: PaletteOptions['primary'];
  }
}

// Update the Button's color prop options
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    light: true;
    dark: true;
  }
}
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    light: true;
    dark: true;
  }
}

// --------------------------------------------------

const BASE_FONT_SIZE = 16;
const remBase = (n: number) => `${(n / BASE_FONT_SIZE).toFixed(4)}rem`;

/**
 * Beanstalk's primary color pallete.
 *
 * Does NOT yet account for prior variance for theming.
 * See `constants/colors.ts`.
 */
export const BeanstalkPalette = {
  // Greens
  logoGreen: '#46B955',
  lightGreen: '#E1F8E6',
  // Blues
  lightBlue: '#C1DEF2',
  babyBlue: '#E2F2FE',
  lighterBlue: '#daf2ff', // see `bodyBackground`
  lightestBlue: '#F6FAFE',
  darkBlue: '#1F78B4',
  // Other
  white: '#fff',
  black: '#333',
  gray: '#657265',
  lightishGrey: '#9E9E9E',
  washedRed: '#c35f42',
  yellow: '#f0df6a',
  darkNavyBlue: '#3c76af',
  brown: '#795739',
  hoverBlue: '#f9fcff',
  lightYellow: '#FDF4E7',
  warningYellow: '#F2A64A',
  washedGreen: '#E1F8E6',
};

// FIXME: changes to createTheme don't hot reload.
let muiTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 800,
      lg: 1200,
      xl: 1536,
    },
  },
  
  /**
   *
   */
  spacing: 10,

  /**
   *
   */
  shape: {
    borderRadius: 10,
  },

  /**
   * https://mui.com/material-ui/customization/palette/
   */
  palette: {
    primary: {
      main: BeanstalkPalette.logoGreen,
      light: BeanstalkPalette.lightGreen,
      contrastText: 'white',
    },
    secondary: {
      main: BeanstalkPalette.lightBlue,
      light: BeanstalkPalette.lighterBlue,
      dark: BeanstalkPalette.darkBlue,
      contrastText: 'black',
    },
    light: {
      main: BeanstalkPalette.white,
      contrastText: BeanstalkPalette.black,
    },
    dark: {
      main: BeanstalkPalette.black,
      contrastText: BeanstalkPalette.white,
    },
    //
    text: {
      primary: '#333333',
      // secondary: BeanstalkPalette.white,
      // disabled: BeanstalkPalette.white,
    },
  },

  /**
   *
   */
  typography: {
    fontFamily: 'Futura PT',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    // h1: page titles
    h1: {
      fontSize: remBase(0.75 * 40),
      fontWeight: 700, //
    },
    // h2: card titles, tabs, large button text
    h2: {
      fontSize: remBase(20),
      fontWeight: 600, //
    },
    // h3: bold section titles
    h3: {
      fontSize: '1rem', // 1*16  = 16px
      fontWeight: 600, //
    },
    // h4: normal section titles
    h4: {
      fontSize: '1rem', // 1*16 = 16px
      fontWeight: 400, //
    },
    // subtitle1: page subtitle
    subtitle1: {
      fontSize: '1.125rem', // 1.125*16 = 18px
      fontWeight: 400,
    },
    subtitle2: {},
    body1: {
      fontSize: '1rem', // 1*16     = 16px
      fontWeight: 400,
      lineHeight: '1.28rem', // pulled from figma
    },
    body2: {},
    button: {
      fontSize: remBase(0.75 * 20),
    },
  },

  /**
   *
   */
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
        color: 'secondary',
      },
      styleOverrides: {
        root: sx({
          borderWidth: 1,
          borderColor: 'secondary.main',
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: sx({
          borderColor: BeanstalkPalette.lightBlue,
          borderWidth: 0.5,
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'contained',
      },
      styleOverrides: {
        root: sx({
          textTransform: 'none',
          fontWeight: 'bold',
        }),
        sizeLarge: sx({
          py: 1.5,
        }),
        disabled: sx({
          pointerEvents: 'auto',
        })
      },
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: sx({}),
      },
      variants: [
        {
          props: {
            variant: 'outlined',
          },
          style: {
            background: 'transparent',
            borderColor: BeanstalkPalette.lightBlue,
          },
        },
      ],
    },
    MuiAccordionSummary: {
      styleOverrides: {
        // FIXME: trying to disable the increase
        // in margin on AccordionSummary during expansion.
        // None of these work...
        root: {
          minHeight: '0 !important',
          my: 0,
        },
        expanded: sx({
          minHeight: '0 !important',
          m: [0, 0],
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        color: 'secondary',
      },
      styleOverrides: {
        root: {},
      },
    },
    MuiTabs: {
      defaultProps: {},
      styleOverrides: {
        root: {
          fontWeight: 'normal',
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: sx({
          p: 0,
          minHeight: 0,
          mr: 2,
          textAlign: 'left',
          minWidth: 0,

          fontWeight: 'normal',
          textTransform: 'none',
          color: 'gray',
          fontSize: 20,
          '&:active': {},
          // FIXME: unsure why `selected` style
          // override doesn't work here.
          '&.Mui-selected': {
            fontWeight: 'bold',
            color: BeanstalkPalette.black,
          },
        }),
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {},
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: 'text',
        size: 'small',
      },
      styleOverrides: {
        root: {
          // Hide border dividers
          '&:not(:last-child)': {
            borderColor: 'transparent !important',
            border: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'transparent',
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: sx({
          px: 2,
        })
      }
    }
  },
});

muiTheme = responsiveFontSizes(muiTheme);

export default muiTheme;
