import React from 'react';
import { ContentSection } from '../Common';
import BeanCharts from './BeanCharts';
import SiloCharts from './SiloCharts';
import FieldCharts from './FieldCharts';

export default function Charts(props) {
  const marginTop = props.marginTop == null ? '-80px' : props.marginTop;
  return (
    <ContentSection
      id="charts"
      title="Charts"
      size="20px"
      style={{ minHeight: '600px', maxWidth: '1000px', marginTop: marginTop }}
    >
      <BeanCharts />
      <SiloCharts />
      <FieldCharts />
    </ContentSection>
  );
}
