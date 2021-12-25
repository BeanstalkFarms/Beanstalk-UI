import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { ContentTitle, SectionTabs } from 'components/Common';

export default function Page({
  sections,
  sectionTitles,
  textTransform,
  sectionNumber = 0,
}) {
  const [section, setSection] = useState(sectionNumber);
  const history = useHistory();

  useEffect(() => {
    history.push(`${sectionTitles[section].toLowerCase().replace(/ /g, '')}`);
  });

  const pageStyle = {
    width: '100%',
    textAlign: 'center'
  };

  // If multiple sections are provided, show a tab selector.
  // Otherwise, show a basic title component.
  const titleSection = sections.length > 1 ? (
    <SectionTabs
      setSection={setSection}
      section={section}
      sectionTitles={sectionTitles}
    />
  ) : (
    <ContentTitle
      title={sectionTitles[0]}
      textTransform={textTransform}
    />
  );

  return (
    <>
      <Box style={pageStyle}>
        {titleSection}
        {sections[section]}
      </Box>
    </>
  );
}
