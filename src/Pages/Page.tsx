import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ContentTitle, SectionTabs } from 'components/Common';
import About from 'components/About';

export default function Page({
    sections,
    sectionTitles,
  }) {
  const [section, setSection] = useState(0);

  const pageStyle = {
      marginTop: '100px',
      width: '100vw',
      marginBottom: '100px',
  };

  const titleSection = sections.length > 1 ?
    (
      <SectionTabs
        setSection={setSection}
        section={section}
        sectionTitles={sectionTitles}
      />
    ) : (<ContentTitle title={sectionTitles[0]} />);

  return (
    <>
      <Box style={pageStyle}>
        {titleSection}
        {sections[section]}
      </Box>
      {window.location.pathname !== '/about' ?
        <About />
        : null
      }
    </>
  );
}
