import React from 'react';
import { theme as colors } from 'constants/index';
import { Tab, Tabs } from '@material-ui/core';

export default function SectionTabs({
    setSection,
    section,
    sectionTitles,
  }) {
  const tabsStyle = {
    margin: 'auto',
    maxWidth: '400px',
    width: '80%',
    backgroundColor: colors.module.background,
    borderRadius: '10px',
    padding: '5px',
  };

  const tabProps = {
    style: {
      zIndex: 99,
      backgroundColor: colors.primary,
      height: '100%',
      borderRadius: '10px',
    },
  };

  const tabStyle = {
      minWidth: 0,
      zIndex: 100,
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
