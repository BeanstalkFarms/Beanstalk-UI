import React from 'react';
import { AppState } from 'state';
import { theme as colors } from 'constants/index';
import { useSelector } from 'react-redux';
import { Tab, Tabs, adaptV4Theme } from '@mui/material';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

const tabHeight = '48px';

const useStyles = makeStyles({
  tabsStyle: {
    margin: 'auto',
    height: tabHeight,
    minHeight: tabHeight,
    maxWidth: (props: any) => `${Math.max(props.sectionTitles.length * 120, 300)}px`,
    minWidth: (props: any) => (props.minWidth),
    width: (props: any) => (props.width < 550 ? '95%' : '80%'),
    backgroundColor: colors.module.background,
    padding: '0 5px',
    borderRadius: '10px',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
  },
  tabStyle: {
      minWidth: 0,
      zIndex: 100,
      borderRadius: '10px',
      margin: '5px 0 5px 0',
      minHeight: '38px',
      padding: '0 6px',
      fontSize: (props: any) => (props.width < 425 ? '12px' : (props.width < 600 ? '14px' : '18px')),
      fontFamily: 'Futura-PT-Book',
  }
});

export default function SectionTabs({
  setSection,
  section,
  sectionTitles,
  minWidth,
}) {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const classes = useStyles({ width: width, minWidth: minWidth, sectionTitles: sectionTitles });

  // FIXME
  const theme = createTheme(adaptV4Theme({
    overrides: {
      MuiTab: {
        root: {
          '&$selected': {
            color: colors.accentText,
            fill: colors.accentText,
          },
        },
      },
    },
  }));

  const tabProps = {
    style: {
      zIndex: 99,
      backgroundColor: colors.primary,
      borderRadius: '10px',
      margin: '5px 0px',
      height: '38px',
      boxShadow: '0px 1.5px 2px rgba(0, 0, 0, 0.4)',
      color: 'white',
    },
  };

  const handleChange = (event, newValue) => {
    setSection(newValue);
  };

  const tabs = sectionTitles.map((s, i) => (<Tab key={i} className={classes.tabStyle} label={s} />));

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Tabs
          TabIndicatorProps={tabProps}
          className={classes.tabsStyle}
          value={section}
          variant="fullWidth"
          onChange={handleChange}
          centered
        >
          {tabs}
        </Tabs>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
