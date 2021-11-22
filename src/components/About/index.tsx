import React from 'react';
import { Link, Box } from '@material-ui/core';
import {
  HOW_TO_PATH,
  HOW_TO_MOBILE_PATH,
  INTRO_TO_PATH,
  WHITEPAPER,
} from 'constants/index';
import { ContentSection, Grid } from 'components/Common';
import { SvgCloudIcon } from './SvgCloudIcon';

export default function About(props) {
  const cloudDivStyle = {
    display: 'inline-flex',
    justifyContent: 'center',
    width: '100%',
  };
  const cloudStyle = {
    maxWidth: '400px',
  };
  const sectionContentStyle = {
    ...props.style,
    marginBottom: '200px',
  };

  const showLandingPage = props.defaultSection !== undefined;

  return (
    <>
      <ContentSection
        id="about"
        style={showLandingPage ? { minHeight: '99vh' } : sectionContentStyle}
        title={showLandingPage ? 'Beanstalk' : 'About'}
      >
        <Box style={{ minHeight: '330px', width: '100%', paddingTop: '90px' }}>
          {props.defaultSection}
          <Grid container style={cloudDivStyle}>
            <Grid item lg={3} md={3} sm={4} xs={6} style={cloudStyle}>
              <Link href={INTRO_TO_PATH} color="inherit" target="tutorial">
                <SvgCloudIcon text="About Beanstalk" />
              </Link>
            </Grid>
            <Grid item lg={3} md={3} sm={4} xs={6} style={cloudStyle}>
              <Link // eslint-disable-line
                href=""
                color="inherit"
                onClick={(event) => {
                  event.preventDefault();
                  const howToPath =
                    window.innerWidth < 600 ? HOW_TO_MOBILE_PATH : HOW_TO_PATH;
                  window.open(howToPath, 'tutorial');
                }}
              >
                <SvgCloudIcon text="How To Guide" />
              </Link>
            </Grid>
            <Grid item lg={3} md={3} sm={4} xs={6} style={cloudStyle}>
              <Link href={WHITEPAPER} color="inherit" target="tutorial">
                <SvgCloudIcon text="Whitepaper" />
              </Link>
            </Grid>
          </Grid>
        </Box>
      </ContentSection>
    </>
  );
}
