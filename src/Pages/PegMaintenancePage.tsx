import React from 'react';
import { Page } from 'Pages/index';
import Seasons from 'components/Seasons';

export default function PegMaintenancePage() {
  const sectionTitles = ['Peg Maintenance'];
  const sections = [<Seasons />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
