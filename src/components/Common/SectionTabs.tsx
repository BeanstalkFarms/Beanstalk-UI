import React, { useState, useEffect } from 'react';
import { theme as colors } from 'constants/index';
import { Tab, Tabs } from '@material-ui/core';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

export default function SectionTabs({
    setSection,
    section,
    sectionTitles,
  }) {
  const tabHeight = '48px';

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const theme = createTheme({
    overrides: {
      MuiTab: {
        root: {
          '&$selected': {
            color: colors.accentText,
          },
        },
      },
    },
  });

  const tabsStyle = {
    margin: 'auto',
    height: tabHeight,
    minHeight: tabHeight,
    maxWidth: `${Math.max(sectionTitles.length * 120, 300)}px`,
    width: '80%',
    backgroundColor: colors.module.background,
    padding: '0 5px',
    borderRadius: '10px',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
  };

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

  const tabStyle = {
      minWidth: 0,
      zIndex: 100,
      borderRadius: '10px',
      margin: '5px 0 5px 0',
      minHeight: '38px',
      padding: '0 6px',
      fontSize: width < 425 ? '12px' : (width < 600 ? '14px' : '18px'),
      fontFamily: 'Futura-PT-Book',
  };

  const handleChange = (event, newValue) => {
    setSection(newValue);
  };

  const tabs = sectionTitles.map((s, i) => (<Tab key={i} style={tabStyle} label={s} />));

  return (
    <MuiThemeProvider theme={theme}>
      <Tabs
        TabIndicatorProps={tabProps}
        style={tabsStyle}
        value={section}
        variant="fullWidth"
        onChange={handleChange}
        centered
      >
        {tabs}
      </Tabs>
    </MuiThemeProvider>
  );
}
