import {
  createTheme,
  experimental_sx as sx,
  lighten,
  responsiveFontSizes,
} from '@mui/material/styles';
import React from 'react';

// --------------------------------------------------

declare module '@mui/material/styles' {
  interface Palette {
    light: Palette['primary'];
    dark: Palette['primary'];
    cancel: Palette['primary'];
    inverse: Palette['primary'];
    naked: Palette['primary'];
  }
  interface PaletteOptions {
    light: PaletteOptions['primary'];
    dark: PaletteOptions['primary'];
    cancel: PaletteOptions['primary'];
    inverse: PaletteOptions['primary'];
    naked: PaletteOptions['primary'];
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

  interface TypeText {
    tertiary?: string;
  }
}

// Update the Button's color prop options
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    light: true;
    dark: true;
    cancel: true;
    inverse: true;
    naked: true;
  }
}
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    light: true;
    dark: true;
    cancel: true;
    inverse: true;
    naked: true;
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

declare module '@mui/material/Tooltip' {
  interface TooltipProps {
    variant?: 'wide';
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
  mediumGreen: lighten('#46B955', 0.7),
  lightGreen: '#E1F8E6',
  supportGreen: '#19873B',
  lightestGreen: '#EDF8EE',
  // Blues
  blue: '#C1DEF2',
  lightBlue: '#DAEBF7',
  lightestBlue: '#F6FAFE',
  darkBlue: '#1F78B4',
  nightBlue: '#162B49',
  skyBlue: '#DBEDFD',
  // Other
  grey: '#657265',
  lightGrey: '#9E9E9E',
  lightestGrey: '#DDDDDD',
  white: '#fff',
  black: '#333',
  // Reds
  // #FBE6E0
  washedRed: '#c35f42',
  mediumRed: lighten('#c35f42', 0.55),
  hoverRed: '#fef9f8',
  trueRed: '#AE2D20',
  lightestRed: '#FBEAEB',
  // Yellow
  yellow: '#f0df6a',
  lightYellow: '#FDF4E7',
  warningYellow: '#F2A64A',
  // Brown
  brown: 'rgba(121,87,57,1)',
  lightBrown: 'rgba(121,87,57,0.2)',

  // ---
  theme: {
    fall: {
      extraLight: '#FFFCED',
      light: '#FBE39D',
      primary: '#FFDE7B',
      brown: '#B97D46',
      lightBrown: '#E5D7C8',
    }
  },
};

export const PAGE_BG_COLOR = BeanstalkPalette.theme.fall.light;
export const PAGE_BORDER_COLOR = BeanstalkPalette.theme.fall.primary;

export const IconSize = {
  xs: 14,
  small: 20,
  medium: 25,
  large: 50,
  tokenSelect: 44,
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
  bold: 700,
};

export const XXLWidth = 1400;

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
    divider: BeanstalkPalette.theme.fall.primary,
    primary: {
      main: BeanstalkPalette.theme.fall.brown,
      light: BeanstalkPalette.lightGreen,
      contrastText: '#ffffff',
    },
    secondary: {
      main: BeanstalkPalette.theme.fall.light,
      dark: BeanstalkPalette.theme.fall.primary,
      contrastText: '#000000',
    },
    light: {
      main: BeanstalkPalette.white,
      contrastText: BeanstalkPalette.black,
    },
    inverse: {
      main: BeanstalkPalette.white,
      contrastText: BeanstalkPalette.logoGreen,
    },
    dark: {
      main: BeanstalkPalette.black,
      contrastText: BeanstalkPalette.white,
    },
    cancel: {
      main: BeanstalkPalette.washedRed,
      contrastText: '#ffffff',
    },
    naked: {
      main: 'transparent',
      contrastText: BeanstalkPalette.black,
    },
    //
    text: {
      primary: BeanstalkPalette.black,
      secondary: 'gray',
      tertiary: BeanstalkPalette.lightGrey,
    },
    background: {
      default: BeanstalkPalette.theme.fall.light,
      paper: BeanstalkPalette.white,
    }
  },

  /**
   *
   */
  typography: {
    fontFamily: 'Futura PT',
    fontSize: 16,

    // FONT WEIGHTS
    fontWeightLight: FontWeight.normal,
    fontWeightRegular: FontWeight.medium,
    fontWeightMedium: FontWeight.semiBold,
    fontWeightBold: FontWeight.bold,

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
      lineHeight: '1.25rem', // 20px
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
      fontWeight: FontWeight.medium,
    },
    // nav labels, nav button labels, token labels (module)
    bodyMedium: {
      fontFamily: 'Futura PT',
      fontSize: FontSize['1xl'], // 20px
      fontWeight: FontWeight.medium,
      lineHeight: '1.875rem',
    },
    // token inputs (module)
    bodyLarge: {
      fontFamily: 'Futura PT',
      fontSize: FontSize['2xl'], // 24px
      fontWeight: FontWeight.medium,
      lineHeight: '1.875rem', // 30px
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
          borderColor: PAGE_BORDER_COLOR,
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: sx({
          borderColor: BeanstalkPalette.theme.fall.light,
          borderWidth: 0.5,
        }),
      },
    },
    MuiButton: {
      variants: [
        {
          props: {
            variant: 'outlined',
            color: 'dark',
          },
          style: {
            borderColor: 'rgba(0, 0, 0, 0.26)',
          },
        },
      ],
      defaultProps: {
        disableElevation: true,
        variant: 'contained',
        disableRipple: true,
      },
      styleOverrides: {
        root: sx({
          textTransform: 'none',
          // fontWeight: 'bold',
          '&.MuiButton-root:hover': {
            // backgroundColor: BeanstalkPalette.supportGreen,
          },
          '&.MuiLoadingButton-root:hover': {
            // backgroundColor: BeanstalkPalette.supportGreen,
          },
          fontWeight: 700,
          fontSize: '1rem',
          lineHeight: '1.25rem',
        }),
        /// Sizes
        sizeSmall: sx({}),
        sizeMedium: sx({
          py: 1,
          px: 1,
          height: '45px',
        }),
        sizeLarge: sx({
          py: 1.5,
          px: 1.5,
          height: '60px',
        }),
        disabled: sx({
          pointerEvents: 'auto',
        }),
        startIcon: sx({
          marginLeft: 0, // prevent adornment from pulling close to right margin
        }),
        endIcon: sx({
          marginRight: 0, // prevent adornment from pulling close to right margin
        }),
      },
    },
    MuiAlert: {
      defaultProps: {},
      styleOverrides: {
        root: sx({
          px: 1,
          alignItems: 'center',
          '& .MuiAlert-icon': {
            m: 0,
            p: 0,
          },
        }),
        message: sx({
          ml: 0.5,
        }),
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 0,
        leaveTouchDelay: 1000000,
        onClick: (e) => e.stopPropagation(),
      },
      variants: [
        {
          props: {
            variant: 'wide',
          },
          style: {},
        },
      ],
      styleOverrides: {
        tooltip: sx({
          typography: 'body1',
          borderColor: 'divider',
          borderWidth: 1,
          borderStyle: 'solid',
          backgroundColor: BeanstalkPalette.theme.fall.extraLight,
          color: 'text.primary',
          p: 1,
          px: 1.25,
          transition: 'box-shadow none 300ms',
        }),
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
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
        root: sx({
          minHeight: '0 !important',
          my: 0,
          px: 1,
        }),
        expanded: sx({
          minHeight: '0 !important',
          m: [0, 0],
        }),
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: sx({
          pt: 0,
          pb: 1,
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
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          borderRadius: '10px',
        },
        sizeSmall: {
          fontSize: '1.1rem',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: sx({
          borderRadius: 1,
          '&.Mui-selected': {
            backgroundColor: BeanstalkPalette.lightGreen,
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: sx({
          borderRadius: 1,
          px: 1,
          py: 1,
          border: '2px solid white',
        }),
      },
    },
    MuiList: {
      styleOverrides: {
        root: sx({
          // p: 0
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTabs: {
      defaultProps: {
        variant: 'scrollable',
      },
      styleOverrides: {
        root: sx({
          fontWeight: 'normal',
          mr: { xs: 2, md: 0 },
          minHeight: 0,
        }),
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
          color: 'text.secondary',
          // fontSize: 20,
          '&:active': {},
          '&:hover': {
            color: 'text.primary',
            labelIcon: {
              color: 'text.primary',
            },
          },
          '&.Mui-selected': {
            // fontWeight: 'bold',
            fontWeight: 700,
            fontSize: '1rem', // 1*16 = 16px
            color: 'text.primary',
          },
        }),
      },
    },
    MuiButtonBase: {
      // variants: [
      //   {
      //     props: { color: 'light' },
      //     style: sx({
      //       borderWidth: 1,
      //       borderColor: 'red',
      //     }),
      //   }
      // ],
      styleOverrides: {},
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
          '&.MuiTab-iconWrapper': {
            color: BeanstalkPalette.black,
            mr: 0,
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
        PaperProps: {
          sx: {
            minWidth: { xs: '95%', sm: '400px' },
          },
        },
      },
      styleOverrides: {
        root: sx({}),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: sx({
          px: 1,
          // pb: 0.5,
        }),
      },
    },
    MuiChip: {
      variants: [
        {
          props: {
            variant: 'filled',
            color: 'primary',
          },
          style: sx({
            color: BeanstalkPalette.logoGreen,
            backgroundColor: BeanstalkPalette.lightestGreen,
          }),
        },
        {
          props: {
            variant: 'filled',
            color: 'secondary',
          },
          style: sx({
            color: BeanstalkPalette.darkBlue,
            backgroundColor: BeanstalkPalette.lightestBlue,
          }),
        },
      ],
      styleOverrides: {
        root: sx({
          fontWeight: 'normal',
          borderRadius: 1,
        }),
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          animationDuration: '0.8s',
        },
        circleIndeterminate: sx({
          animation: 'none',
          strokeDasharray: '80px, 200px',
          strokeDashoffset: '0px',
        }),
      },
    },
  },
});

muiTheme = responsiveFontSizes(muiTheme);

export default muiTheme;
