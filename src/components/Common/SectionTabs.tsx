import React from 'react';
import { theme as colors } from 'constants/index';
import { Tab, Tabs } from '@material-ui/core';

export default function SectionTabs({
    setSection,
    section,
    sectionTitles,
  }) {
  const tabHeight = '48px';

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
    },
  };

  const tabStyle = {
      minWidth: 0,
      zIndex: 100,
      minHeight: '38px',
      height: '48px',
      fontSize: '18px',
  };

  const handleChange = (event, newValue) => {
    setSection(newValue);
  };

  const tabs = sectionTitles.map((s) => (<Tab style={tabStyle} label={s} />));

  return (
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
  );
}
