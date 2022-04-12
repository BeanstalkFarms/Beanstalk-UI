import React, { useState } from 'react';
// import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import { ContentTitle, SectionTabs } from 'components/Common';

const pageStyle = {
  width: '100%',
  textAlign: 'center',
  paddingBottom: 80,
  fontFamily: 'Futura-PT-Book',
};

export default function Page({
  sections,
  sectionTitles,
  // routeTitle,
  textTransform,
  sectionNumber = 0,
  hideTitles = false,
  // noRedirect = false,
}) {
  const [section, setSection] = useState(sectionNumber);
  // const history = useHistory();
  // useEffect(() => {
  //   if (!noRedirect) {
  //     console.log(`!noRedirect`, routeTitle, sectionTitles)
  //     history.push(`${(!routeTitle ? sectionTitles[section] : routeTitle).toLowerCase().replace(/ /g, '')}`);
  //   }
  // });

  // If multiple sections are provided, show a tab selector.
  // Otherwise, show a basic title component.
  const titleSection = !hideTitles ? (
    sections.length > 1 ? (
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
    )
  ) : null;

  return (
    <Box style={pageStyle}>
      {titleSection}
      {sections[section]}
    </Box>
  );
}
