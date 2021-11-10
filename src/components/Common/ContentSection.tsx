import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { setHideShowState } from 'state/hideShowHandler/actions';
import { AppState } from 'state';
import { ContentTitle } from './index';
import { theme } from '../../constants';

export default function ContentSection(props) {
  const dispatch = useDispatch();

  const hideShowState = useSelector<AppState, AppState['hideShowHandler']>(
    (state) => state.hideShowHandler
  );

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

  const handleHideShowSection = (id) => {
    dispatch(
      setHideShowState({
        [id]: !hideShowState[id],
      })
    );
  };

  const { innerWidth: width } = window;
  const descriptionSection =
    props.description !== undefined ? (
      <Box
        className={`section-description-${theme.name}`}
        style={
          width > 500
            ? {
                maxWidth: '550px',
                margin: '20px 0 0 0',
                padding: '12px',
                color: theme.backgroundText,
              }
            : {
                width: width - 64,
                margin: '20px 0',
                padding: '12px',
                color: theme.backgroundText,
              }
        }
      >
        {props.description}
        {props.descriptionLinks.map((l) => (
          <span key={l.text}>
            {' '}
            <Link
              style={{ color: theme.backgroundText }}
              key={l.text}
              href={l.href}
              target="blank"
            >
              {l.text}
            </Link>
            .
          </span>
        ))}
      </Box>
    ) : null;

  const shouldShow = !!hideShowState[props.id];

  return (
    <Box id={props.id} className="AppContent" style={props.style}>
      <Grid
        container
        spacing={3}
        className={classes.appSection}
        justifyContent="center"
      >
        <ContentTitle
          onClick={() => {
            console.log('props.id', props.id);
            handleHideShowSection(props.id);
          }}
          {...props} />
        {shouldShow ? descriptionSection : null}
        {shouldShow ? props.children : null}
      </Grid>
    </Box>
  );
}

ContentSection.defaultProps = {
  descriptionLinks: [],
  width: '100%',
  minHeight: '0px',
};
