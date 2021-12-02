import React from 'react';
import { Page } from 'Pages/index';
import Governance from 'components/Governance';
import Fundraiser from 'components/Fundraiser';

export default function DAO() {
  const sectionTitles = ['Governance', 'Fundraiser'];
  const sections = [<Governance />, <Fundraiser />];
  return (
    <Page sections={sections} sectionTitles={sectionTitles} />
  );
}
