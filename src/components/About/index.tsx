import React, { FC, ReactComponentElement } from 'react';
import { Link, Box } from '@mui/material';
import {
  HOW_TO_PATH,
  HOW_TO_MOBILE_PATH,
  INTRO_TO_PATH,
  WHITEPAPER,
} from 'constants/index';
import { ContentSection, Grid } from 'components/Common';
import makeStyles from '@mui/styles/makeStyles';
import SvgCloudIcon from './SvgCloudIcon';

const useStyles = makeStyles(({
  cloudDivStyle: {
    display: 'inline-flex',
    justifyContent: 'center',
    width: '100%',
  },
  cloudStyle: {
    maxWidth: '400px',
  }
}));

interface AboutProps {
    style?: string;
    defaultSection?: ReactComponentElement<any>;
}

const About: FC<AboutProps> = (props) => {
  const classes = useStyles();
  const sectionContentStyle = props.style;
  const showLandingPage = props.defaultSection !== undefined;

  return (
    <ContentSection
      id="about"
      style={showLandingPage ? { minHeight: '0vh' } : sectionContentStyle}
      title={showLandingPage ? 'Beanstalk' : 'About'}
    >
      <Box style={{ minHeight: '330px', width: '100%', paddingTop: '90px' }}>
        {props.defaultSection}
        {/* */}
        <Grid container className={classes.cloudDivStyle}>
          <Grid item lg={3} md={3} sm={4} xs={6} className={classes.cloudStyle}>
            <Link href={INTRO_TO_PATH} color="inherit" target="tutorial" underline="hover">
              <SvgCloudIcon text="About Beanstalk" />
            </Link>
          </Grid>
          <Grid item lg={3} md={3} sm={4} xs={6} className={classes.cloudStyle}>
            <Link
              href=""
              color="inherit"
              onClick={(event) => {
                event.preventDefault();
                const howToPath =
                  window.innerWidth < 600 ? HOW_TO_MOBILE_PATH : HOW_TO_PATH;
                window.open(howToPath, 'tutorial');
              }}
              underline="hover">
              <SvgCloudIcon text="How To Guide" />
            </Link>
          </Grid>
          <Grid item lg={3} md={3} sm={4} xs={6} className={classes.cloudStyle}>
            <Link href={WHITEPAPER} color="inherit" target="tutorial" underline="hover">
              <SvgCloudIcon text="Whitepaper" />
            </Link>
          </Grid>
        </Grid>
      </Box>
    </ContentSection>
  );
};

export default About;
