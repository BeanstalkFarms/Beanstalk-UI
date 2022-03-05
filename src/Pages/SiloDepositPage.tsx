import React from 'react';
import { Page } from 'Pages/index';
import SiloTransaction from 'components/Silo/SiloActions';

export default function SiloDepositPage(props) {
  const sectionTitles = ['Silo'];
  const sections = [<SiloTransaction />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      noRedirect
      sectionNumber={props.sectionNumber}
    />
  );
}
