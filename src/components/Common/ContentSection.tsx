import React from 'react';
import { Link, Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ContentTitle } from './index';
import { theme } from '../../constants';

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
}) {
  const [shouldDisplaySection, setshouldDisplaySection] = React.useState(true);
  const [shouldDisplayDescription, setshouldDisplayDescription] = React.useState(true);

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
    if (JSON.parse(localStorage.getItem(`is_${id}_hidden`) || 'false')) {
      setshouldDisplaySection(false);
    }
    if (JSON.parse(localStorage.getItem(`is_${id}_description_hidden`) || 'false')) {
      setshouldDisplayDescription(false);
    }
  }, [id]);

  const handleisSectionHiddenSection = (): void => {
    setshouldDisplaySection(!shouldDisplaySection);
    localStorage.setItem(
      `is_${id}_hidden`,
      JSON.stringify(shouldDisplaySection)
    );
  };

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
        className={shouldDisplayDescription ? `section-description-${theme.name}` : ''}
        style={
          innerWidth > 500
            ? {
              maxWidth: '550px',
              margin: '0px 0 10px 0',
              padding: '12px',
              color: theme.backgroundText,
            }
            : {
              width: innerWidth - 64,
              margin: '0 0 10px 0',
              padding: '12px',
              color: theme.backgroundText,
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
        ) : (null)}

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
          onClick={() => {
            handleisSectionHiddenSection();
          }}
          padding={padding}
          marginTop={marginTop}
          width={width}
          title={title}
          size={size}
          textTransform={textTransform}
        />
        {shouldDisplaySection ? descriptionSection : null}
        {shouldDisplaySection ? children : null}
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
