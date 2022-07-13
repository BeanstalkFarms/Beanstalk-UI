import {
  createTheme,
  experimental_sx as sx,
  responsiveFontSizes
} from '@mui/material/styles';
import React from 'react';

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
  interface TypographyVariants {
    bodySmall: React.CSSProperties;
    bodyMedium: React.CSSProperties;
    bodyLarge: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    bodySmall?: React.CSSProperties;
    bodyMedium?: React.CSSProperties;
    bodyLarge?: React.CSSProperties;
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

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    bodySmall: true;
    bodyMedium: true;
    bodyLarge: true;
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
  washedGreen: '#E1F8E6',
  supportGreen: '#19873B',
  // Blues
  lightBlue: '#C1DEF2',
  babyBlue: '#E2F2FE',
  lighterBlue: '#daf2ff', // see `bodyBackground`
  lightestBlue: '#F6FAFE',
  darkBlue: '#1F78B4',
  darkNavyBlue: '#3c76af',
  hoverBlue: '#f9fcff',
  // Other
  white: '#fff',
  black: '#333',
  gray: '#657265',
  lightishGrey: '#9E9E9E',
  washedRed: '#c35f42',
  hoverRed: '#fef9f8',
  yellow: '#f0df6a',
  brown: '#795739',
  lightYellow: '#FDF4E7',
  warningYellow: '#F2A64A',
};

export const IconSize = {
  // xs: '14px',
  // small: '20px',
  // medium: '25px',
  // large: '50px',
  xs: 14,
  small: 20,
  medium: 25,
  large: 50
};

export const FontSize = {
  '3xl': '2rem', // 2*16 = 32px
  '2xl': '1.5rem', // 1.5*16 = 24px,
  '1xl': '1.25rem', // 1.25*16 = 20px,
  lg: '1.125rem', // 1.125*16 = 18px,
  base: '1rem', // 1*16 = 16px,
  sm: '0.875rem', // 0.875*16 = 14px,
  xs: '0.75rem', // 0.75*16 = 12px
};

export const FontWeight = {
  normal: 400,
  medium: 450,
  semiBold: 600,
  bold: 700
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
    fontSize:           16,

    // FONT WEIGHTS
    fontWeightLight:      FontWeight.normal,
    fontWeightRegular:    FontWeight.medium,
    fontWeightMedium:   FontWeight.semiBold,
    fontWeightBold:         FontWeight.bold,

    // page headers
    h1: {
      fontSize: FontSize['3xl'], // 32px
      fontWeight: FontWeight.bold,
    },
    // silo deposit graph
    h2: {
      fontSize: FontSize['2xl'], // 24px
      fontWeight: FontWeight.bold,
    },
    // nav button text
    h3: {
      fontSize: FontSize['1xl'], // 20px
      fontWeight: FontWeight.semiBold,
    },
    // component headers / tabs
    h4: {
      fontSize: FontSize.base, // 16px
      fontWeight: FontWeight.semiBold,
    },
    // ---
    body1: {
      fontSize: FontSize.base, // 16px
      fontWeight: FontWeight.normal,
      lineHeight: '1.25rem',
    },
    // all module body text
    bodySmall: {
      fontFamily: 'Futura PT',
      fontSize: FontSize.sm, // 14px
      fontWeight: FontWeight.medium
    },
    // nav labels, nav button labels, token labels (module)
    bodyMedium: {
      fontFamily: 'Futura PT',
      fontSize: FontSize['1xl'], // 20px
      fontWeight: FontWeight.medium,
      lineHeight: '1.875rem'
    },
    // token inputs (module)
    bodyLarge: {
      fontFamily: 'Futura PT',
      fontSize: FontSize['2xl'], // 24px
      fontWeight: FontWeight.medium
    },
    // page subtitles
    subtitle1: {
      fontSize: FontSize.lg, // 18px
      fontWeight: FontWeight.normal,
    },
    button: {
      fontSize: remBase(0.75 * 20),
    },
  },

  // --------------------------------------------

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
        disableRipple: true
      },
      styleOverrides: {
        root: sx({
          textTransform: 'none',
          fontWeight: 'bold',
          '&.MuiLoadingButton-root:hover': {
            backgroundColor: BeanstalkPalette.supportGreen,
          }
        }),
        sizeLarge: sx({
          py: 1.5,
          height: '60px'
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
        root: {
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem'
        },
        sizeSmall: {
          fontSize: '1.1rem'
        }
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: sx({
          '&.Mui-selected': {
            backgroundColor: BeanstalkPalette.washedGreen,
            borderRadius: 1,
          },
        })
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: sx({
          borderRadius: 1,
          px: 1,
          py: 1
        }),
      }
    },
    MuiList: {
      styleOverrides: {
        root: sx({
          // p: 0
        })
      }
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
        },
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
          // fontWeight: 'normal',
          fontWeight: 700,
          fontSize: '1rem', // 1*16 = 16px
          textTransform: 'none',
          color: 'gray',
          // fontSize: 20,
          '&:active': {},
          '&:hover': {
            color: BeanstalkPalette.black,
          },
          // FIXME: unsure why `selected` style
          // override doesn't work here.
          '&.Mui-selected': {
            // fontWeight: 'bold',
            fontWeight: 700,
          fontSize: '1rem', // 1*16 = 16px
            color: BeanstalkPalette.black,
          },
        }),
      },
    },
    MuiButtonBase: {
      styleOverrides: {
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
    MuiDialog: {
      defaultProps: {  
        transitionDuration: 0,
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: sx({
          px: 1,
        })
      }
    },
  },
});

muiTheme = responsiveFontSizes(muiTheme);

export default muiTheme;
