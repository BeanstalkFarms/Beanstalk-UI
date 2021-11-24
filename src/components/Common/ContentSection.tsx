import React from 'react';
import { Box, Link, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { theme } from 'constants/index';
import { ContentTitle } from './index';

export default function ContentSection({
  description,
  descriptionLinks,
  children,
  id,
  marginTop,
  padding,
  size,
  style,
  textTransform,
  title,
  width,
  textAlign,
}) {
  const [shouldDisplayDescription, setshouldDisplayDescription] =
    React.useState(true);

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
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  })();

  React.useEffect(() => {
    // on initialize fetch is_hidden variable or default to false. if is_hidden set shouldDisplay to false

    if (
      JSON.parse(localStorage.getItem(`is_${id}_description_hidden`) || 'false')
    ) {
      setshouldDisplayDescription(false);
    }
  }, [id]);

  const handleisSectionHiddenDescription = (): void => {
    setshouldDisplayDescription(!shouldDisplayDescription);
    localStorage.setItem(
      `is_${id}_description_hidden`,
      JSON.stringify(shouldDisplayDescription)
    );
  };

  const { innerWidth } = window;
  const descriptionSection =
    description !== undefined ? (
      <Box
        className={
          shouldDisplayDescription ? `section-description-${theme.name}` : ''
        }
        style={
          innerWidth > 500
            ? {
                maxWidth: '550px',
                margin: '0 0 10px 0',
                padding: '12px',
                color: theme.backgroundText,
                textAlign: textAlign,
              }
            : {
                width: innerWidth - 64,
                margin: '0 0 10px 0',
                padding: '12px',
                color: theme.backgroundText,
                textAlign: textAlign,
              }
        }
      >
        {shouldDisplayDescription ? (
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
        ) : null}

        <Box
          className={classes.hideButton}
          role="button"
          tabIndex={0}
          aria-pressed="false"
          onClick={() => handleisSectionHiddenDescription()}
          onKeyDown={() => {}}
        >
          {shouldDisplayDescription ? ' Hide' : 'Show'}
        </Box>
      </Box>
    ) : null;

  return (
    <Box id={id} className="AppContent" style={style}>
      <Grid
        container
        spacing={3}
        className={classes.appSection}
        justifyContent="center"
      >
        <ContentTitle
          padding={padding}
          marginTop={marginTop}
          width={width}
          title={title}
          size={size}
          textTransform={textTransform}
        />
        {descriptionSection}
        {children}
      </Grid>
    </Box>
  );
}

ContentSection.defaultProps = {
  descriptionLinks: [],
  padding: '30px 15px',
  width: '100%',
  minHeight: '0px',
  textAlign: 'center',
};
