import React from 'react';
import { Page } from 'Pages/index';
import Silo from 'components/Silo';

export default function Farm(props) {
  const sectionTitles = ['Silo'];
  const sections = [<Silo />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      sectionNumber={props.sectionNumber}
    />
  );
}
