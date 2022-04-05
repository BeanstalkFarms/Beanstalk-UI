import React, { FC } from 'react';
import { Box, Link, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { theme } from 'constants/index';

const useStyles = makeStyles({
  appSection: {
    padding: (props: any) => props.padding,
    margin: '0px',
  },
  sectionTitle: {
    marginTop: (props: any) => props.marginTop,
    width: (props: any) => props.width,
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
  sectionStyle: {
      width: window.innerWidth - 64,
      margin: '10px 0 10px 0',
      padding: '12px',
      color: theme.backgroundText,
      textAlign: (props) => props.textAlign,
      '@media (min-width: 500px)': {
          maxWidth: '550px',
      }
  }
});

interface ContentSectionProps {
  description?: string;
  title?: string;
  descriptionLinks?: [{text:string, href: string}];
  children: any;
  id: string;
  marginTop?: string;
  marginBottom?: number;
  padding?: string;
  width?: string;
  textAlign?: string;
  minHeight?: string;
  paddingTop?: string;
}

const ContentSection: FC<ContentSectionProps> = ({
  description,
  title,
  descriptionLinks,
  children,
  id,
  marginTop,
  padding,
  paddingTop,
  width,
  textAlign,
  minHeight,
  marginBottom
}) => {
  const [shouldDisplayDescription, setshouldDisplayDescription] =
    React.useState(true);

  const classes = useStyles({ marginTop, padding, width });

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

  const descriptionSection =
    description !== undefined ? (
      <Box
        className={
          shouldDisplayDescription ? `section-description-${theme.name}` : ''
        }
      >
        <Box className={classes.sectionStyle}>
          {shouldDisplayDescription ? (
            <>
              {description}
              {descriptionLinks !== undefined && descriptionLinks.map((l) => (
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
      </Box>
    ) : null;

  return (
    <Box id={id} className="AppContent" sx={{ paddingTop: paddingTop, width: width, marginBottom: marginBottom }}>
      <Grid
        container
        spacing={3}
        className={classes.appSection}
        justifyContent="center"
      >
        {descriptionSection}
        {children}
      </Grid>
    </Box>
  );
};

ContentSection.defaultProps = {
  descriptionLinks: [{ text: '', href: '' }],
  padding: '0px 0px',
  width: '100%',
  minHeight: '0px',
  textAlign: 'center',
};

export default ContentSection;
