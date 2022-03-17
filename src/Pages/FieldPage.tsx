import React from 'react';
import { Page } from 'pages/index';
import Field from 'components/Field';

export default function Farm(props) {
  const sectionTitles = ['Field'];
  const sections = [<Field />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      sectionNumber={props.sectionNumber}
    />
  );
}
