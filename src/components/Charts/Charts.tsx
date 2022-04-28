import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { BaseModule } from 'components/Common';
import { AppState } from 'state';
import { Chart } from './Chart';

export default function Charts(props) {
  const [section, setSection] = useState(0);

  const [dataMode, setDataMode] = useState('hr');
  const [timeMode, setTimeMode] = useState('month');
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  if (props.charts.length === 0) {
    return null;
  }

  const modeProps = {
    dataMode: dataMode,
    timeMode: timeMode,
    setDataMode: setDataMode,
    setTimeMode: setTimeMode,
  };

  const isMobile: boolean = width <= 768;
  const sections = props.charts.map((c) => (
    <Chart
      data={c.data}
      isMobile={isMobile}
      key={c.title}
      title={`${c.title}`}
      {...c.props}
      {...modeProps}
      {...props}
    />
  ));
  // TODO: style
  const baseStyle = isMobile
    ? { width: '100%', paddingLeft: 0, paddingRight: 0 }
    : { margin: 'auto' };

  const titles = props.charts.map((c) => {
    if (width < 520 && c.shortTitle !== undefined) {
      return c.shortTitle.toUpperCase();
    }
    if (c.tabTitle !== undefined) {
      return c.tabTitle;
    }
    return (
      <span>{c.title.toUpperCase()}</span>
    );
  });

  const descriptions =
    props.charts[0].description !== undefined
      ? props.charts.map((c) => c.description)
      : undefined;

  return (
    <BaseModule
      handleTabChange={(event, newSection) => {
        setSection(newSection);
      }}
      section={section}
      sectionTitles={titles}
      showButton={false}
      size="small"
      marginTop="20px"
      sectionTitlesDescription={descriptions}
      style={baseStyle}
      textTransform="None"
      textTabSize={isMobile ? '11px' : undefined}
    >
      {sections[section]}
    </BaseModule>
  );
}
