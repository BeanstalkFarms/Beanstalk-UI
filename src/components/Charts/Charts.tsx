import React, { useState, useEffect } from 'react';
import { BaseModule, ContentTitle } from '../Common';
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

  const isMobile: boolean = (width <= 650);
  const sections = props.charts.map((c) => (<Chart data={c.data} isMobile={isMobile} key={c.title} title={`${c.title}`} {...c.props} {...modeProps} {...props} />));
  const baseStyle = isMobile ? { width: '100vw', paddingLeft: 0, paddingRight: 0 } : null;

  const titles = props.charts.map((c) => {
    if (isMobile && c.shortTitle !== undefined) return c.shortTitle;
    return c.title;
  });

  return (
    <>
      <ContentTitle
        id="Bean Charts"
        title={props.mainTitle}
        size="18px"
        style={{ minHeight: '0', maxWidth: '1000px' }}
      />
      <BaseModule
        handleTabChange={(event, newSection) => { setSection(newSection); }}
        removeBackground
        section={section}
        sectionTitles={titles}
        showButton={false}
        size="small"
        style={baseStyle}
        >
        {sections[section]}
      </BaseModule>
    </>
  );
}
