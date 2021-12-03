import React from 'react';
import { Page } from 'Pages/index';
import About from 'components/About';

export default function AboutPage() {
  const sectionTitles = ['About'];
  const sections = [<About />];
  return (
    <Page sections={sections} sectionTitles={sectionTitles} />
  );
}
