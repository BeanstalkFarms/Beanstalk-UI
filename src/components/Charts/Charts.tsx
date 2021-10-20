import React, { useState, useEffect } from 'react';
import { BaseModule } from '../Common';
import { Chart } from './Chart';

export default function Charts(props) {
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
  }, []);

  const modeProps = {
    dataMode: dataMode,
    timeMode: timeMode,
    setDataMode: setDataMode,
    setTimeMode: setTimeMode,
  };

  const isMobile: boolean = (width <= 550);
  const sections = props.charts.map((c) => (<Chart data={c.data} isMobile={isMobile} key={c.title} title={`${props.mainTitle} ${c.title}`} {...c.props} {...modeProps} {...props} />));
  const baseStyle = isMobile ? { width: '100vw', paddingLeft: 0, paddingRight: 0 } : null;

  return (
    <BaseModule
      handleTabChange={(event, newSection) => { setSection(newSection); }}
      removeBackground
      section={section}
      sectionTitles={props.charts.map((c) => c.title)}
      showButton={false}
      size="small"
      style={baseStyle}
      >
      {sections[section]}
    </BaseModule>
  );
}
