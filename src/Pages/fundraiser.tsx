import React from 'react';
import { Page } from 'pages/index';
import Fundraiser from 'components/Fundraiser';

export default function FundraiserPage() {
  const sectionTitles = ['Fundraiser'];
  const sections = [<Fundraiser />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
