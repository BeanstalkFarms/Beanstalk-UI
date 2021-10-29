import React from 'react';
import { Link, Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ContentTitle } from './index';
import { theme } from '../../constants';

export default function ContentSection(props) {
  const classes = makeStyles({
    appSection: {
      padding: props.padding,
    },
    sectionTitle: {
      marginTop: props.marginTop,
      width: props.width,
      color: theme.backgroundText,
    },
  })();

  const { innerWidth: width } = window;
  const descriptionSection = props.description !== undefined ?
  (
    <Box
      className={`section-description-${theme.name}`}
      style={
        width > 500
          ? { maxWidth: '550px', margin: '20px 0 0 0', padding: '12px', color: theme.backgroundText }
          : { width: width - 64, margin: '20px 0', padding: '12px', color: theme.backgroundText }
      }
    >
      {props.description}
      {props.descriptionLinks.map((l) => (
        <span key={l.text}>
          {' '}
          <Link style={{ color: theme.backgroundText }} key={l.text} href={l.href} target="blank">
            {l.text}
          </Link>
          .
        </span>
      ))}
    </Box>
    )
  : null;

  return (
    <Box id={props.id} className="AppContent" style={props.style}>
      <Grid
        container
        spacing={3}
        className={classes.appSection}
        justifyContent="center"
      >
        <ContentTitle {...props} />
        {descriptionSection}
        {props.children}
      </Grid>
    </Box>
  );
}

ContentSection.defaultProps = {
  descriptionLinks: [],
  padding: '60px 30px',
  marginTop: '-28px',
  width: '100%',
};
