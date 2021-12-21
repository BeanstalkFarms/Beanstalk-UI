import React from 'react';
import { Page } from 'Pages/index';
import Field from 'components/Field';
import Trade from 'components/Trade';
import Balances from 'components/Balances';
import Silo from 'components/Silo';

export default function Farm(props) {
  const sectionTitles = ['Silo', 'Field', 'Trade', 'Balances'];
  const sections = [<Silo />, <Field />, <Trade />, <Balances />];

  return (
    <Page sections={sections} sectionTitles={sectionTitles} sectionNumber={props.sectionNumber} />
  );
}
