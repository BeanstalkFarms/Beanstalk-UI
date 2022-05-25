import {
  createTheme,
  experimental_sx as sx,
} from '@mui/material/styles';

declare module '@mui/material/styles' {
  // interface Theme {
  //   status: {
  //     danger: React.CSSProperties['color'];
  //   };
  // }

  interface Palette {
    light: Palette['primary'];
    dark: Palette['primary'];
  }
  interface PaletteOptions {
    light: PaletteOptions['primary'];
    dark: PaletteOptions['primary'];
  }

  // interface ThemeOptions {
  //   status: {
  //     danger: React.CSSProperties['color'];
  //   };
  // }
}

/**
 * Beanstalk's primary color pallete.
 * 
 * Does NOT yet account for prior variance for theming.
 * See `constants/colors.ts`.
 */
export const BeanstalkPalette = {
  logoGreen: '#46B955',
  lightBlue: '#C1DEF2',
  lighterBlue: '#daf2ff', // see `bodyBackground`
  darkBlue: '#1F78B4',
  white: '#fff',
  black: '#333',
  lightishGrey: '#9E9E9E'
};

// FIXME: changes to createTheme don't hot reload.
const muiTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 801,
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
    }
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
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.25rem', // 36px = 2.25*16
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 400,
    },
    h5: {},
    h6: {},
    subtitle1: {},
    subtitle2: {},
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '1.28rem', // pulled from figma
    },
    body2: {},
    button: {},
  },

  /**
   * 
   */
  components: {
    /**
     * 
     */
    MuiCard: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
        color: 'secondary'
      },
      styleOverrides: {
        root: sx({
          borderWidth: 1,
          borderColor: 'secondary.main',
        })
      }
    },
    /**
     * 
     */
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
      },
    },
    /**
     * FIXME:
     * - Gradient border not working; see AccordionWrapper.tsx
     */
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: sx({
          background: 'linear-gradient(90deg, rgba(70, 185, 85, 0.2) 0%, rgba(123, 97, 255, 0.2) 36.58%, rgba(31, 120, 180, 0.2) 96.2%)',
          borderWidth: 1,
          borderColor: BeanstalkPalette.darkBlue,
          borderStyle: 'solid',
        }),
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
        }
      ]
    },
    /**
     * https://mui.com/material-ui/react-text-field/
     */
    MuiTextField: {
      defaultProps: {
        color: 'secondary',
      },
      styleOverrides: {
        root: {
          // borderWidth: '3px',
          // borderImageWidth: 0.5,
        },
      }
    },
    /**
     * 
     */
    MuiTabs: {
      defaultProps: {},
      styleOverrides: {
        root: {
          fontWeight: 'normal'
        },
        indicator: {
          display: 'none',
        },
      }
    },
    /**
     * 
     */
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
          }
        }),
      }
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          // fontWeight: "bold",
        }
      }
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: 'text',
        size: 'small'
      },
      styleOverrides: {
        root: {
          // Hide border dividers
          '&:not(:last-child)': {
            borderColor: 'transparent !important',
            border: 'none',
          }
        },
      }
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'transparent'
      }
    }
  }
});

export default muiTheme;
