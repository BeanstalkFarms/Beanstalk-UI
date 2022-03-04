import React from 'react';
import { Page } from 'Pages/index';
import SiloDeposit from 'components/Silo/SiloDeposit';

export default function SiloDepositPage(props) {
  const sectionTitles = ['poop'];
  const sections = [<SiloDeposit />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      noRedirect
      sectionNumber={props.sectionNumber}
    />
  );
}
