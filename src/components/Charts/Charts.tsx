import React, { useState, useEffect } from 'react';
import { BaseModule } from 'components/Common';
import BaseChart from './BaseChart';

export default function Charts(props) {
  console.log('props.charts', props.charts);
  const [section, setSection] = useState(0);
  const [dataMode, setDataMode] = useState('hr');
  const [timeMode, setTimeMode] = useState('week');

  const [width, setWidth] = useState<number>(window.innerWidth);
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, [props.charts]);

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
  const sections = props.charts.map((c) => (<BaseChart
    data={c.data}
    isMobile={isMobile}
    key={c.title}
    title={`${c.title}`}
    {...c.props}
    {...modeProps}
    {...props}
    />));

  const baseStyle = isMobile
    ? { width: '100%', paddingLeft: 0, paddingRight: 0 }
    : null;

  const titles = props.charts.map((c) => {
    if (width < 520 && c.shortTitle !== undefined) {
      return c.shortTitle.toUpperCase();
    }
    if (c.tabTitle !== undefined) {
      return c.tabTitle;
    }
    return c.title.toUpperCase();
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
      marginBottom="40px"
      sectionTitlesDescription={descriptions}
      style={baseStyle}
      textTransform="None"
      textTabSize={isMobile ? '11px' : undefined}
      setAllowance={undefined}
      handleApprove={undefined}
      handleForm={undefined}
      lockedSeasons={undefined}
      resetForm={undefined}
      widthTooltip={undefined}
      marginTooltip={undefined}>
      {sections[section]}
    </BaseModule>
  );
}
