import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  BaseModule,
  ContentDropdown,
  ContentSection,
  curveStrings,
  Grid,
} from 'components/Common';
import CurveModule from './CurveModule';

export default function Curve() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  return (
    <ContentSection id="field" title="Field">
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={curveStrings.description}
          descriptionTitle="What is the BEAN:3Crv LP Pool?"
        />
      </Grid>
      <Grid
        container
        item
        xs={12}
        spacing={2}
        className="SiloSection"
        alignItems="flex-start"
        justifyContent="center"
        style={{ minHeight: '550px' }}
      >
        <Grid
          item
          md={6}
          sm={12}
          style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
        >
          <BaseModule
            section={0}
            sectionTitles={['']}
            sectionTitlesDescription={['']}
            showButton={false}
            removeBackground
            normalBox={false}
          >
            <CurveModule />
          </BaseModule>
        </Grid>
      </Grid>
    </ContentSection>
  );
}
