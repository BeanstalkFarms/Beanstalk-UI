import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Grid, Box, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { setHideShowState } from 'state/hideShowHandler/actions';
import { AppState } from 'state';
import { ContentTitle } from './index';
import { theme } from '../../constants';

export default function ContentSection({ padding?, marginTop?, width?, description?, descriptionLinks?, style?, id?, children?, title?, size?, textTransform? }) {
  const dispatch = useDispatch();

  const hideShowState = useSelector<AppState, AppState['hideShowHandler']>(
    (state) => state.hideShowHandler
  );

  const classes = makeStyles({
    appSection: {
      padding: padding,
    },
    sectionTitle: {
      marginTop: marginTop,
      width: width,
      color: theme.backgroundText,
    },
    hideButton: {
      borderRadius: '12px',
      fontFamily: 'Futura-Pt-Book',
      fontSize: 'calc(10px + 1vmin)',
      height: '10px',
      width: '100px',
    },
  })();

  const handleHideShowSection = (sectionID: string): void => {
    dispatch(
      setHideShowState({
        [sectionID]: !hideShowState[sectionID],
      })
    );
  };

  const handleHideShowDescription = (sectionID: string): void => {
    dispatch(
      setHideShowState({
        ...hideShowState,
        descriptions: {
          ...hideShowState.descriptions,
          [sectionID]: !hideShowState.descriptions[sectionID],
        },
      }
      )
    );
  };

  const descriptionSection =
    description !== undefined ? (
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
        {hideShowState.descriptions[id] ? (
          <>
            {description}
            {descriptionLinks.map((l) => (
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
          </>
        ) : (null)}
        <Button
          className={classes.hideButton}
          color="primary"
          onClick={() => handleHideShowDescription(id)}
          variant="text"
          size="small"
          >
          {hideShowState.descriptions[id] ? 'HIDE' : 'SHOW'}
        </Button>
      </Box>
    ) : null;

  const shouldShow = !!hideShowState[id];

  return (
    <Box id={id} className="AppContent" style={style}>
      <Grid
        container
        spacing={3}
        className={classes.appSection}
        justifyContent="center"
      >
        <ContentTitle
          onClick={() => {
            handleHideShowSection(id);
          }}
          padding={padding}
          marginTop={marginTop}
          width={width}
          title={title}
          size={size}
          textTransform={textTransform}
        />
        {shouldShow ? descriptionSection : null}
        {shouldShow ? children : null}
      </Grid>
    </Box>
  );
}

ContentSection.defaultProps = {
  descriptionLinks: [],
  padding: '30px 15px',
  width: '100%',
  minHeight: '0px',
};
